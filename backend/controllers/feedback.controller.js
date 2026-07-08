import feedbackService from '../services/feedback.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Create new feedback entry.
 * POST /api/feedback
 */
export const createFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const feedback = await feedbackService.createFeedback(userId, req.body, req.file);

    return ApiResponse.success(
      res,
      'Thank you! Your feedback has been submitted successfully.',
      {
        feedbackId: feedback._id,
        status: feedback.status,
        createdAt: feedback.createdAt
      },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to submit feedback report.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Fetch paginated list of current user's feedback.
 * GET /api/feedback/my
 */
export const getMyFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await feedbackService.getMyFeedback(userId, page, limit);

    return ApiResponse.success(
      res,
      'My feedback submissions fetched successfully.',
      result,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to retrieve feedback list.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});
