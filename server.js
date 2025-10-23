/**
 * Main Express Server Configuration
 * 
 * This file sets up the Express.js server with middleware, routes, and error handling.
 * It provides a RESTful API for managing posts with consistent response formatting.
 * 
 * Features:
 * - CORS configuration for cross-origin requests
 * - Request logging for debugging
 * - JSON parsing with size limits
 * - Centralized error handling
 * - Health check endpoint
 * 
 * @author Your Name
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

/**
 * CORS Middleware Configuration
 * 
 * Configures Cross-Origin Resource Sharing to allow requests from multiple environments.
 * Supports both development (localhost) and production (Vercel) origins.
 */
const allowedOrigins = [
  'http://localhost:5173',           // Local development (Vite)
  'http://localhost:3000',           // Local development (React)
  'https://week-6-frontend.vercel.app', // Production frontend
  process.env.FRONTEND_URL           // Custom environment URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true // Allow cookies and authorization headers
}));

/**
 * Body Parsing Middleware
 * 
 * Configures Express to parse JSON and URL-encoded request bodies.
 * Sets a 10MB limit to handle larger payloads if needed.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Request Logging Middleware
 * 
 * Logs all incoming requests with timestamp, method, and path.
 * Useful for debugging and monitoring API usage.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 * 
 * Mounts all API routes under the '/api' prefix.
 * Routes are organized in separate modules for better maintainability.
 */
app.use('/api', apiRoutes);

/**
 * Root Endpoint
 * 
 * Provides a health check endpoint that returns server status and version info.
 * Useful for monitoring and verifying the server is running.
 * 
 * @route GET /
 * @returns {Object} JSON response with server status
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'API Server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    },
    error: null
  });
});

/**
 * Error Handling Middleware
 * 
 * These middleware functions handle 404 errors and other unhandled errors.
 * They must be registered last to catch all unhandled requests and errors.
 */
app.use(notFoundHandler);
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

/**
 * Start the Express Server
 * 
 * Starts the server on the specified port and logs startup information.
 * The server will listen for incoming HTTP requests on all network interfaces.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
