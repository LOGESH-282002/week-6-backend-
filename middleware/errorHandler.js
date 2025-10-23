/**
 * Error Handling Middleware
 * 
 * This module provides centralized error handling for the Express application.
 * It includes handlers for both 404 (Not Found) errors and general server errors.
 * 
 * All error responses follow the consistent format:
 * { success: false, error: string, data: null }
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * Global Error Handler Middleware
 * 
 * Catches all unhandled errors in the application and returns a consistent
 * error response. This middleware should be registered last in the middleware stack.
 * 
 * @param {Error} err - The error object that was thrown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON error response with 500 status code
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error('Unhandled error:', err);
  
  // Return a generic error message to avoid exposing sensitive information
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    data: null
  });
};

/**
 * 404 Not Found Handler Middleware
 * 
 * Handles requests to undefined routes by returning a 404 error response.
 * This middleware should be registered after all route handlers but before
 * the general error handler.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON error response with 404 status code
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    data: null
  });
};