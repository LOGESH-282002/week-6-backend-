/**
 * Posts API Routes
 * 
 * This module defines all REST API endpoints for managing posts.
 * It provides full CRUD operations with proper validation, error handling,
 * and consistent response formatting.
 * 
 * All responses follow the format: { success: boolean, data: any, error: string | null }
 * 
 * Endpoints:
 * - GET    /posts      - List posts with pagination and search
 * - GET    /posts/:id  - Get a single post by ID
 * - POST   /posts      - Create a new post
 * - PUT    /posts/:id  - Update an existing post
 * - DELETE /posts/:id  - Delete a post
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from 'express';
import { supabase } from '../config/database.js';
import { validateId, validatePagination, validatePostData, sanitizeString } from '../utils/validation.js';

// Create Express router instance
const router = express.Router();

/**
 * GET /api/posts - Retrieve all posts with pagination and search
 * 
 * Fetches posts from the database with support for pagination and text search.
 * Search is performed across both title and body fields using case-insensitive matching.
 * Results are ordered by ID in descending order (newest first).
 * 
 * @route GET /api/posts
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of posts per page (max 100)
 * @param {string} [search=''] - Search term for title/body filtering
 * @returns {Object} JSON response with posts array and pagination info
 * @throws {400} Bad Request - If database query fails
 * @throws {500} Internal Server Error - If unexpected error occurs
 */
router.get('/', async (req, res) => {
    try {
        // Extract query parameters with defaults
        const {
            page = 1,
            limit = 10,
            search = ''
        } = req.query;

        // Validate and sanitize pagination parameters
        const { pageNum, limitNum } = validatePagination(page, limit);
        const offset = (pageNum - 1) * limitNum;

        // Build Supabase query with count for pagination
        let query = supabase
            .from('posts')
            .select('id, title, body, user_id', { count: 'exact' });

        // Apply search filter if search term is provided
        // Uses case-insensitive LIKE matching on both title and body
        if (search.trim()) {
            query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
        }

        // Apply pagination and ordering (newest posts first)
        query = query
            .range(offset, offset + limitNum - 1)
            .order('id', { ascending: false });

        // Execute the query
        const { data, error, count } = await query;

        // Handle database errors
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                data: null
            });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limitNum);

        // Return successful response with posts and pagination info
        res.json({
            success: true,
            data: {
                posts: data,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limitNum,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            },
            error: null
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
});

/**
 * GET /api/posts/:id - Retrieve a single post by ID
 * 
 * Fetches a specific post from the database using its unique ID.
 * Returns 404 if the post doesn't exist.
 * 
 * @route GET /api/posts/:id
 * @param {string} id - The unique identifier of the post
 * @returns {Object} JSON response with the post data
 * @throws {400} Bad Request - If ID is invalid or database query fails
 * @throws {404} Not Found - If post with given ID doesn't exist
 * @throws {500} Internal Server Error - If unexpected error occurs
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid positive integer
        if (!validateId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid post ID',
                data: null
            });
        }

        // Query the database for the specific post
        const { data, error } = await supabase
            .from('posts')
            .select('id, title, body, user_id')
            .eq('id', id)
            .single(); // Expect exactly one result

        // Handle database errors
        if (error) {
            // PGRST116 is Supabase's "no rows returned" error code
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Post not found',
                    data: null
                });
            }
            return res.status(400).json({
                success: false,
                error: error.message,
                data: null
            });
        }

        // Return the found post
        res.json({
            success: true,
            data: data,
            error: null
        });
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
});

/**
 * POST /api/posts - Create a new post
 * 
 * Creates a new post in the database with the provided title, body, and user_id.
 * Validates all input data before insertion and sanitizes text fields.
 * 
 * @route POST /api/posts
 * @param {string} title - The post title (required, max 255 chars)
 * @param {string} body - The post content (required, max 10000 chars)
 * @param {number} user_id - The ID of the user creating the post (required)
 * @returns {Object} JSON response with the created post data
 * @throws {400} Bad Request - If validation fails or database insertion fails
 * @throws {500} Internal Server Error - If unexpected error occurs
 */
router.post('/', async (req, res) => {
    try {
        const { title, body, user_id } = req.body;

        // Validate that user_id is provided
        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id is required',
                data: null
            });
        }

        // Validate post title and body using utility function
        const validation = validatePostData(title, body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
                data: null
            });
        }

        // Insert the new post into the database
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                title: sanitizeString(title), // Remove extra whitespace
                body: sanitizeString(body),   // Remove extra whitespace
                user_id
            }])
            .select('id, title, body, user_id') // Return the created post
            .single(); // Expect exactly one result

        // Handle database insertion errors
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                data: null
            });
        }

        // Return the created post with 201 Created status
        res.status(201).json({
            success: true,
            data: data,
            error: null
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
});

/**
 * PUT /api/posts/:id - Update an existing post
 * 
 * Updates a post's title and body content. The user_id cannot be changed.
 * Validates input data and returns 404 if the post doesn't exist.
 * 
 * @route PUT /api/posts/:id
 * @param {string} id - The unique identifier of the post to update
 * @param {string} title - The new post title (required, max 255 chars)
 * @param {string} body - The new post content (required, max 10000 chars)
 * @returns {Object} JSON response with the updated post data
 * @throws {400} Bad Request - If ID is invalid, validation fails, or database update fails
 * @throws {404} Not Found - If post with given ID doesn't exist
 * @throws {500} Internal Server Error - If unexpected error occurs
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body } = req.body;

        // Validate that the ID is a valid positive integer
        if (!validateId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid post ID',
                data: null
            });
        }

        // Validate post title and body using utility function
        const validation = validatePostData(title, body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(', '),
                data: null
            });
        }

        // Update the post in the database
        const { data, error } = await supabase
            .from('posts')
            .update({
                title: sanitizeString(title), // Remove extra whitespace
                body: sanitizeString(body)    // Remove extra whitespace
            })
            .eq('id', id) // Match the specific post ID
            .select('id, title, body, user_id') // Return the updated post
            .single(); // Expect exactly one result

        // Handle database update errors
        if (error) {
            // PGRST116 is Supabase's "no rows returned" error code
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    error: 'Post not found',
                    data: null
                });
            }
            return res.status(400).json({
                success: false,
                error: error.message,
                data: null
            });
        }

        // Return the updated post
        res.json({
            success: true,
            data: data,
            error: null
        });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
});

/**
 * DELETE /api/posts/:id - Delete a post
 * 
 * Permanently removes a post from the database. This action cannot be undone.
 * Returns success even if the post doesn't exist (idempotent operation).
 * 
 * @route DELETE /api/posts/:id
 * @param {string} id - The unique identifier of the post to delete
 * @returns {Object} JSON response with success message
 * @throws {400} Bad Request - If ID is invalid or database deletion fails
 * @throws {500} Internal Server Error - If unexpected error occurs
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid positive integer
        if (!validateId(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid post ID',
                data: null
            });
        }

        // Delete the post from the database
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id); // Match the specific post ID

        // Handle database deletion errors
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message,
                data: null
            });
        }

        // Return success message (idempotent - succeeds even if post didn't exist)
        res.json({
            success: true,
            data: { message: 'Post deleted successfully' },
            error: null
        });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            data: null
        });
    }
});

export default router;