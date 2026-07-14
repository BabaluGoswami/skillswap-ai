import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

/**
 * Centralized Express Error Handler Middleware.
 * Categorizes and formats errors into a unified API response schema.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`💥 [Error] ${err.name || 'Exception'}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Handle Zod Schema validation errors
  if (err.name === 'ZodError') {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    console.log("💥 ZOD VALIDATION FAILED DETAILS:", formattedErrors);
    
    return ApiResponse.error(
      res,
      RESPONSE_MESSAGES.BAD_REQUEST,
      formattedErrors,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle Mongoose cast errors (invalid ObjectIDs)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid field format: ${err.path}`,
      [err.message],
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Default server error fallback
  const statusCode = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || RESPONSE_MESSAGES.SERVER_ERROR;

  return ApiResponse.error(
    res,
    message,
    process.env.NODE_ENV === 'development' ? [err.stack] : [],
    statusCode
  );
};

export default errorHandler;
