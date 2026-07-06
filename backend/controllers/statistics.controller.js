import statisticsService from '../services/statistics.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Retrieves platform dashboard/home statistics.
 * GET /api/statistics
 */
export const getPlatformStatistics = asyncHandler(async (req, res) => {
  try {
    const stats = await statisticsService.getPlatformStatistics();
    return ApiResponse.success(
      res,
      'Platform statistics retrieved successfully.',
      stats,
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to fetch platform statistics.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});
