import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';

/**
 * Admin Authorization Gate Middleware.
 * Rejects requests from authenticated users who are not administrators.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(
      res,
      'Access denied: User is not authenticated.',
      [],
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (req.user.role !== 'Admin') {
    return ApiResponse.error(
      res,
      'Access denied: Administrator permissions are required.',
      [],
      HTTP_STATUS.FORBIDDEN
    );
  }

  // User is Admin
  next();
};

export default adminOnly;
