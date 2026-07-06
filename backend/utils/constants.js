/**
 * HTTP Status Codes for standard REST APIs
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Common API Response messages
 */
export const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation completed successfully.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this operation.',
  FORBIDDEN: 'Access forbidden.',
  BAD_REQUEST: 'Invalid request data.',
  SERVER_ERROR: 'Internal server error occurred. Please try again later.',
  CONNECTION_SUCCESS: 'SkillSwap AI services running smoothly.',
};
