import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import SwapRequest from '../models/SwapRequest.js';
import Conversation from '../models/Conversation.js';
import Report from '../models/Report.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/admin/dashboard
 * Retrieve key platform-wide admin metrics.
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. User Status Counters
  const totalUsers = await User.countDocuments({ status: { $ne: 'deleted' } });
  const activeUsers = await User.countDocuments({ status: 'active' });
  const bannedUsers = await User.countDocuments({ status: 'banned' });
  const disabledUsers = await User.countDocuments({ status: 'disabled' });

  // 2. Swaps and Feedback Counters
  const totalSwaps = await SwapRequest.countDocuments();
  const totalFeedback = await Feedback.countDocuments();
  const openFeedback = await Feedback.countDocuments({ status: 'Open' });
  const resolvedFeedback = await Feedback.countDocuments({ status: 'Resolved' });
  const totalChatSessions = await Conversation.countDocuments();

  // 3. User Reports and Warnings Metrics
  const pendingReports = await Report.countDocuments({ status: 'Pending' });
  const underReviewReports = await Report.countDocuments({ status: 'Under Review' });
  
  const warningSumStats = await User.aggregate([
    { $group: { _id: null, totalWarnings: { $sum: '$warningsCount' } } }
  ]);
  const totalWarnings = warningSumStats.length > 0 ? warningSumStats[0].totalWarnings : 0;

  // 4. Today's New Signups
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysNewUsers = await User.countDocuments({
    createdAt: { $gte: startOfToday },
    status: { $ne: 'deleted' }
  });

  // 5. Rating Average calculation
  const ratingStats = await User.aggregate([
    { $match: { ratingAverage: { $gt: 0 }, status: { $ne: 'deleted' } } },
    { $group: { _id: null, avgRating: { $avg: '$ratingAverage' } } }
  ]);
  const averageRating = ratingStats.length > 0 ? parseFloat(ratingStats[0].avgRating.toFixed(2)) : 0;

  return ApiResponse.success(
    res,
    'Admin dashboard metrics retrieved successfully.',
    {
      totalUsers,
      activeUsers,
      bannedUsers,
      disabledUsers,
      totalSwaps,
      totalFeedback,
      openFeedback,
      resolvedFeedback,
      totalChatSessions,
      todaysNewUsers,
      averageRating,
      pendingReports,
      underReviewReports,
      totalWarnings
    },
    HTTP_STATUS.OK
  );
});

/**
 * GET /api/admin/users
 * Paginated list of users with search, role filters, and sort options.
 */
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, role, status, sortBy } = req.query;

  const query = {};

  // Exclude deleted by default unless explicitly filtering for it
  if (status) {
    query.status = status;
  } else {
    query.status = { $ne: 'deleted' };
  }

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  let sortOrder = { createdAt: -1 }; // Newest first
  if (sortBy === 'oldest') {
    sortOrder = { createdAt: 1 };
  } else if (sortBy === 'name') {
    sortOrder = { name: 1 };
  }

  const skip = (page - 1) * limit;
  const rawItems = await User.find(query)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit);

  const items = await Promise.all(rawItems.map(async (u) => {
    const userObj = u.toObject();
    userObj.reportsReceivedCount = await Report.countDocuments({ reportedUser: u._id });
    userObj.reportsSubmittedCount = await Report.countDocuments({ reporter: u._id });
    return userObj;
  }));

  const total = await User.countDocuments(query);

  return ApiResponse.success(
    res,
    'Users fetched successfully.',
    {
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    },
    HTTP_STATUS.OK
  );
});

/**
 * GET /api/admin/users/:id
 * Retrieve details for a single user.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.status === 'deleted') {
    return ApiResponse.error(res, 'User not found or has been deleted.', [], HTTP_STATUS.NOT_FOUND);
  }

  return ApiResponse.success(res, 'User profile fetched successfully.', user, HTTP_STATUS.OK);
});

/**
 * PATCH /api/admin/users/:id/role
 * Edit user role (Student <-> Admin).
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['Student', 'Mentor', 'Admin'].includes(role)) {
    return ApiResponse.error(res, 'Invalid role specification.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const targetUserId = req.params.id;

  // 1. Self demotion check
  if (req.user._id.toString() === targetUserId) {
    return ApiResponse.error(res, 'Self-action protection: You cannot revoke your own Administrator permissions.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const userToUpdate = await User.findById(targetUserId);
  if (!userToUpdate || userToUpdate.status === 'deleted') {
    return ApiResponse.error(res, 'User not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  // 2. Last admin protection check
  if (userToUpdate.role === 'Admin' && role !== 'Admin') {
    const adminCount = await User.countDocuments({ role: 'Admin', status: { $ne: 'deleted' } });
    if (adminCount <= 1) {
      return ApiResponse.error(res, 'Safety block: Cannot demote the last remaining Administrator.', [], HTTP_STATUS.BAD_REQUEST);
    }
  }

  userToUpdate.role = role;
  await userToUpdate.save();

  return ApiResponse.success(res, 'User role updated successfully.', userToUpdate, HTTP_STATUS.OK);
});

/**
 * PATCH /api/admin/users/:id/status
 * Toggle user account status (Enable, Disable, Ban, Unban).
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled', 'banned', 'deleted'].includes(status)) {
    return ApiResponse.error(res, 'Invalid status specification.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const targetUserId = req.params.id;

  // 1. Self action check
  if (req.user._id.toString() === targetUserId) {
    return ApiResponse.error(res, 'Self-action protection: You cannot modify your own account status.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const userToUpdate = await User.findById(targetUserId);
  if (!userToUpdate || userToUpdate.status === 'deleted') {
    return ApiResponse.error(res, 'User not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  if (userToUpdate.role === 'Admin') {
    return ApiResponse.error(res, 'Security protection: Administrative accounts cannot be disabled or banned.', [], HTTP_STATUS.FORBIDDEN);
  }

  userToUpdate.status = status;
  let statusMessage = `Your account status has been updated to: ${status}`;
  if (status === 'disabled') {
    statusMessage = 'Your account has been temporarily disabled by administration.';
  } else if (status === 'banned') {
    statusMessage = 'Your account has been permanently banned by administration.';
  } else if (status === 'active') {
    statusMessage = 'Your account has been re-enabled and is now active.';
  }
  userToUpdate.notifications.push({
    message: statusMessage
  });
  await userToUpdate.save();

  return ApiResponse.success(res, 'User status updated successfully.', userToUpdate, HTTP_STATUS.OK);
});

/**
 * DELETE /api/admin/users/:id
 * Soft delete a user profile safely.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;

  // 1. Self action check
  if (req.user._id.toString() === targetUserId) {
    return ApiResponse.error(res, 'Self-action protection: You cannot delete your own profile.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const userToUpdate = await User.findById(targetUserId);
  if (!userToUpdate || userToUpdate.status === 'deleted') {
    return ApiResponse.error(res, 'User already deleted or not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  // 2. Last admin protection check
  if (userToUpdate.role === 'Admin') {
    const adminCount = await User.countDocuments({ role: 'Admin', status: { $ne: 'deleted' } });
    if (adminCount <= 1) {
      return ApiResponse.error(res, 'Safety block: Cannot delete the last remaining Administrator.', [], HTTP_STATUS.BAD_REQUEST);
    }
  }

  userToUpdate.status = 'deleted';
  await userToUpdate.save();

  return ApiResponse.success(res, 'User profile deleted successfully (soft-deleted).', null, HTTP_STATUS.OK);
});

/**
 * GET /api/admin/feedback
 * Fetch paginated list of system-wide user feedbacks.
 */
export const getFeedbacks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, type, status, sortBy } = req.query;

  const matchCriteria = {};

  if (status) {
    matchCriteria.status = status;
  }

  if (type) {
    // Map category filters
    if (type === 'Bug Reports') {
      matchCriteria.type = 'Report a Bug';
    } else if (type === 'Feature Requests') {
      matchCriteria.type = 'Suggest a Feature';
    } else if (type === 'General Feedback') {
      matchCriteria.type = 'General Feedback';
    }
  }

  // Locate users matching search input to run nested criteria
  if (search) {
    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    const matchedUserIds = matchedUsers.map(u => u._id);

    matchCriteria.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { user: { $in: matchedUserIds } }
    ];
  }

  let sortOrder = { createdAt: -1 };
  if (sortBy === 'oldest') {
    sortOrder = { createdAt: 1 };
  } else if (sortBy === 'rating') {
    sortOrder = { rating: -1 };
  }

  const skip = (page - 1) * limit;
  const items = await Feedback.find(matchCriteria)
    .populate('user', 'name email profileImage')
    .sort(sortOrder)
    .skip(skip)
    .limit(limit);

  const total = await Feedback.countDocuments(matchCriteria);

  return ApiResponse.success(
    res,
    'Feedbacks retrieved successfully.',
    {
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    },
    HTTP_STATUS.OK
  );
});

/**
 * PATCH /api/admin/feedback/:id
 * Edit feedback status and append support responses.
 */
export const updateFeedback = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) {
    return ApiResponse.error(res, 'Feedback record not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  if (status) {
    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return ApiResponse.error(res, 'Invalid status parameter.', [], HTTP_STATUS.BAD_REQUEST);
    }
    feedback.status = status;
  }

  if (adminNote !== undefined) {
    feedback.adminNote = adminNote.trim();
  }

  await feedback.save();

  return ApiResponse.success(res, 'Feedback updated successfully.', feedback, HTTP_STATUS.OK);
});

/**
 * PATCH /api/admin/users/:id/warn
 * Send a direct warning to a user (Admin Only).
 */
export const warnUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const { reason, adminNote } = req.body;

  if (req.user._id.toString() === targetUserId) {
    return ApiResponse.error(res, 'Self-action protection: You cannot modify your own warnings.', [], HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findById(targetUserId);
  if (!user || user.status === 'deleted') {
    return ApiResponse.error(res, 'User not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  if (user.role === 'Admin') {
    return ApiResponse.error(res, 'Security protection: Administrative accounts cannot be warned.', [], HTTP_STATUS.FORBIDDEN);
  }

  user.warningsCount = (user.warningsCount || 0) + 1;
  user.warnings.push({
    reason: reason || 'Direct Warning',
    adminNote: adminNote || 'Official warning issued by Administrator.',
    date: new Date()
  });

  user.notifications.push({
    message: `Your account received a warning from administration: ${reason || 'Direct Warning'}. (Total warnings: ${user.warningsCount})`
  });

  await user.save();

  return ApiResponse.success(res, 'Warning issued to user successfully.', user, HTTP_STATUS.OK);
});
