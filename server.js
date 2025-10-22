import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/api/posts', async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = ''
  } = req.query;

  const offset = (page - 1) * limit;

  try {
    
    let query = supabase
      .from('posts')
      .select('id, title, body, user_id', { count: 'exact' });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('id', { ascending: false });

    const { data, error, count } = await query;

    if (error) return res.status(400).json({ error: error.message });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      posts: data,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts: count,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, body, user_id } = req.body;
  const { data, error } = await supabase
    .from('posts')
    .insert([{ title, body, user_id }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
