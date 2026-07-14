import swapService from '../services/swap.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Send a new Swap Request.
 * POST /api/swaps/request
 */
export const requestSwap = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  try {
    const request = await swapService.createRequest(senderId, receiverId, message);
    return ApiResponse.success(
      res,
      'Swap request sent successfully.',
      { request },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to send swap request.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Fetch requests sent by the authenticated user.
 * GET /api/swaps/sent
 */
export const getSentRequests = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const requests = await swapService.getSentRequests(senderId);
  return ApiResponse.success(
    res,
    'Sent swap requests fetched successfully.',
    { requests },
    HTTP_STATUS.OK
  );
});

/**
 * Fetch requests received by the authenticated user.
 * GET /api/swaps/received
 */
export const getReceivedRequests = asyncHandler(async (req, res) => {
  const receiverId = req.user._id;
  const requests = await swapService.getReceivedRequests(receiverId);
  return ApiResponse.success(
    res,
    'Received swap requests fetched successfully.',
    { requests },
    HTTP_STATUS.OK
  );
});

/**
 * Accept a pending request.
 * PATCH /api/swaps/:id/accept
 */
export const acceptSwap = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const receiverId = req.user._id;

  try {
    const request = await swapService.acceptRequest(requestId, receiverId);
    return ApiResponse.success(
      res,
      'Swap request accepted successfully.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to accept swap request.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Reject a pending request.
 * PATCH /api/swaps/:id/reject
 */
export const rejectSwap = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const receiverId = req.user._id;

  try {
    const request = await swapService.rejectRequest(requestId, receiverId);
    return ApiResponse.success(
      res,
      'Swap request rejected successfully.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to reject swap request.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Cancel a pending request.
 * DELETE /api/swaps/:id/cancel
 */
export const cancelSwap = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const senderId = req.user._id;

  try {
    const request = await swapService.cancelRequest(requestId, senderId);
    return ApiResponse.success(
      res,
      'Swap request cancelled successfully.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to cancel swap request.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Request completion of an active session.
 * PATCH /api/swaps/:id/request-completion
 */
export const requestCompletion = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const request = await swapService.requestCompletion(requestId, userId);
    return ApiResponse.success(
      res,
      'Session completion requested successfully.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to request session completion.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Accept session completion request.
 * PATCH /api/swaps/:id/accept-completion
 */
export const acceptCompletion = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const request = await swapService.acceptCompletion(requestId, userId);
    return ApiResponse.success(
      res,
      'Session marked as completed successfully.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to accept session completion.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Reject session completion request.
 * PATCH /api/swaps/:id/reject-completion
 */
export const rejectCompletion = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const userId = req.user._id;

  try {
    const request = await swapService.rejectCompletion(requestId, userId);
    return ApiResponse.success(
      res,
      'Session completion rejected.',
      { request },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to reject session completion.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});
