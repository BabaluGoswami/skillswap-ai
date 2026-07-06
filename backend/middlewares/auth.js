import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { env } from '../config/env.js';

/**
 * Authentication Gate Middleware.
 * Decodes JWT authorization header, verifies token authenticity, 
 * checks if the user is registered in the database, and appends user to request.
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer prefix
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Fetch user from DB and append to request (excluding password)
      const user = await User.findById(decoded.id);
      if (!user) {
        return ApiResponse.error(
          res,
          'Authorization failed: User no longer exists.',
          [],
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      req.user = user;
      return next();
    } catch (error) {
      return ApiResponse.error(
        res,
        'Authorization failed: Invalid token signatures.',
        [error.message],
        HTTP_STATUS.UNAUTHORIZED
      );
    }
  }

  if (!token) {
    return ApiResponse.error(
      res,
      'Authorization failed: Bearer token is missing.',
      [],
      HTTP_STATUS.UNAUTHORIZED
    );
  }
};

export default protect;
