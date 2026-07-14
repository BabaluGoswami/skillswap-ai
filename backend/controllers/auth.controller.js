import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Generate a JWT token for the authenticated user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skillsToTeach, skillsToLearn } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(
      res,
      'User already exists with this email address.',
      [],
      HTTP_STATUS.CONFLICT
    );
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    skillsToTeach,
    skillsToLearn,
    role: 'Student',
  });

  // Generate token
  const token = generateToken(user);

  // Return clean user object (excluding password due to select: false)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    xp: user.xp,
    level: user.level,
  };

  return ApiResponse.success(
    res,
    'User registered successfully.',
    { user: userData, token },
    HTTP_STATUS.CREATED
  );
});

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return ApiResponse.error(
      res,
      'Invalid email or password credentials.',
      [],
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return ApiResponse.error(
      res,
      'Invalid email or password credentials.',
      [],
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Check account status
  if (user.status === 'banned') {
    return ApiResponse.error(
      res,
      'Your account has been banned. Please contact support.',
      [],
      HTTP_STATUS.FORBIDDEN
    );
  }
  if (user.status === 'disabled') {
    return ApiResponse.error(
      res,
      'Your account has been disabled. Please contact support.',
      [],
      HTTP_STATUS.FORBIDDEN
    );
  }
  if (user.status === 'deleted') {
    return ApiResponse.error(
      res,
      'Your account has been deleted.',
      [],
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Generate token
  const token = generateToken(user);

  // Return data
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skillsToTeach: user.skillsToTeach,
    skillsToLearn: user.skillsToLearn,
    xp: user.xp,
    level: user.level,
  };

  return ApiResponse.success(
    res,
    'User logged in successfully.',
    { user: userData, token },
    HTTP_STATUS.OK
  );
});
