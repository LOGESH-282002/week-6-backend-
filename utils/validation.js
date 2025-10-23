/**
 * Validation Utility Functions
 * 
 * This module provides reusable validation functions for the backend API.
 * It includes validators for IDs, pagination parameters, post data, and string sanitization.
 * 
 * All validation functions return consistent results that can be used across
 * different route handlers to ensure data integrity and security.
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * Validates that an ID is a positive integer
 * 
 * Checks if the provided ID is a valid positive integer that can be used
 * as a database primary key. Returns false for null, undefined, negative
 * numbers, zero, or non-numeric values.
 * 
 * @param {any} id - The ID value to validate
 * @returns {boolean} True if the ID is valid, false otherwise
 * 
 * @example
 * validateId('123')    // returns true
 * validateId('0')      // returns false
 * validateId('abc')    // returns false
 * validateId(null)     // returns false
 */
export const validateId = (id) => {
  return id && !isNaN(parseInt(id)) && parseInt(id) > 0;
};

/**
 * Validates and sanitizes pagination parameters
 * 
 * Ensures pagination parameters are within acceptable ranges and converts
 * them to safe integer values. Page numbers are clamped to minimum 1,
 * and limit is clamped between 1 and 100 to prevent excessive database loads.
 * 
 * @param {any} page - The page number (will be converted to integer)
 * @param {any} limit - The items per page limit (will be converted to integer)
 * @returns {Object} Object with validated pageNum and limitNum properties
 * 
 * @example
 * validatePagination('2', '50')     // returns { pageNum: 2, limitNum: 50 }
 * validatePagination('-1', '200')   // returns { pageNum: 1, limitNum: 100 }
 * validatePagination('abc', 'xyz')  // returns { pageNum: 1, limitNum: 10 }
 */
export const validatePagination = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  return { pageNum, limitNum };
};

/**
 * Validates post data (title and body)
 * 
 * Performs comprehensive validation on post title and body fields.
 * Checks for required fields, data types, string length limits, and
 * ensures content is not just whitespace.
 * 
 * @param {any} title - The post title to validate
 * @param {any} body - The post body content to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 * 
 * @example
 * validatePostData('Valid Title', 'Valid content')
 * // returns { isValid: true, errors: [] }
 * 
 * validatePostData('', 'x'.repeat(20000))
 * // returns { isValid: false, errors: ['Title is required...', 'Body must be...'] }
 */
export const validatePostData = (title, body) => {
  const errors = [];
  
  // Validate title
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required and must be a non-empty string');
  } else if (title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }
  
  // Validate body
  if (!body || typeof body !== 'string' || !body.trim()) {
    errors.push('Body is required and must be a non-empty string');
  } else if (body.length > 10000) {
    errors.push('Body must be 10000 characters or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes string input by trimming whitespace
 * 
 * Safely trims whitespace from string inputs and handles non-string values
 * by returning an empty string. This helps prevent issues with leading/trailing
 * whitespace in user input.
 * 
 * @param {any} str - The string to sanitize
 * @returns {string} Trimmed string or empty string if input is not a string
 * 
 * @example
 * sanitizeString('  hello world  ')  // returns 'hello world'
 * sanitizeString(null)               // returns ''
 * sanitizeString(123)                // returns ''
 */
export const sanitizeString = (str) => {
  return typeof str === 'string' ? str.trim() : '';
};