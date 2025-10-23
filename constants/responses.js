// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Standard error messages
export const ERROR_MESSAGES = {
  INVALID_ID: 'Invalid ID provided',
  NOT_FOUND: 'Resource not found',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Resource retrieved successfully'
};

// Response helper functions
export const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error
});

export const createSuccessResponse = (data, message = null) => 
  createResponse(true, message ? { ...data, message } : data, null);

export const createErrorResponse = (error) => 
  createResponse(false, null, error);