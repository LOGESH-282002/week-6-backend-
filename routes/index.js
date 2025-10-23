import express from 'express';
import postsRouter from './posts.js';

const router = express.Router();

// Mount route modules
router.use('/posts', postsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    error: null
  });
});

export default router;