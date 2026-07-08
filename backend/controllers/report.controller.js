import Report from '../models/Report.js';
import User from '../models/User.js';
import storageService from '../services/storage.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Submit a report against another user
 */
export const createReport = asyncHandler(async (req, res) => {
  const reporterId = req.user._id;
  const { reportedUser, reason, description } = req.body;

  // 1. Core validations
  if (!reportedUser || !reason || !description) {
    return ApiResponse.error(res, 'Missing required fields (reportedUser, reason, description).', [], HTTP_STATUS.BAD_REQUEST);
  }

  if (reporterId.toString() === reportedUser.toString()) {
    return ApiResponse.error(res, 'Security protection: You cannot report yourself.', [], HTTP_STATUS.FORBIDDEN);
  }

  const reportedProfile = await User.findById(reportedUser);
  if (!reportedProfile) {
    return ApiResponse.error(res, 'Reported user not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  if (reportedProfile.role === 'Admin') {
    return ApiResponse.error(res, 'Security protection: Administrative accounts cannot be reported.', [], HTTP_STATUS.FORBIDDEN);
  }

  if (reportedProfile.status === 'deleted') {
    return ApiResponse.error(res, 'Cannot report a deleted user profile.', [], HTTP_STATUS.BAD_REQUEST);
  }

  if (reportedProfile.status === 'banned') {
    return ApiResponse.error(res, 'Cannot report an already banned user.', [], HTTP_STATUS.BAD_REQUEST);
  }

  // 2. Daily submission limits (Max 5 reports per day)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const reportCountToday = await Report.countDocuments({
    reporter: reporterId,
    createdAt: { $gte: startOfToday, $lte: endOfToday }
  });

  if (reportCountToday >= 5) {
    return ApiResponse.error(res, 'Rate limit exceeded: You can submit a maximum of 5 reports per day.', [], HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  // 3. Duplicate checks within last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const isDuplicate = await Report.findOne({
    reporter: reporterId,
    reportedUser,
    reason,
    description: description.trim(),
    createdAt: { $gte: tenMinutesAgo }
  });

  if (isDuplicate) {
    return ApiResponse.error(res, 'Duplicate submission: You have already filed a similar report in the last 10 minutes.', [], HTTP_STATUS.BAD_REQUEST);
  }

  // 4. Optional screenshot file upload to Cloudinary
  let screenshotUrl = '';
  let screenshotId = '';
  if (req.file) {
    if (req.file.size > 5 * 1024 * 1024) {
      return ApiResponse.error(res, 'File size error: Screenshot cannot exceed 5MB.', [], HTTP_STATUS.BAD_REQUEST);
    }
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return ApiResponse.error(res, 'File format error: Screenshot must be PNG, JPG, JPEG or WebP.', [], HTTP_STATUS.BAD_REQUEST);
    }

    const upload = await storageService.saveFile(req.file.buffer, req.file.originalname);
    screenshotUrl = upload.secure_url;
    screenshotId = upload.public_id;
  }

  // 5. Save report document
  const report = new Report({
    reporter: reporterId,
    reportedUser,
    reason,
    description: description.trim(),
    screenshot: screenshotUrl,
    screenshotPublicId: screenshotId
  });

  await report.save();

  // 6. Push received notice to reporter notification list
  const reporterUser = await User.findById(reporterId);
  if (reporterUser) {
    reporterUser.notifications.push({
      message: `Your report against "${reportedProfile.name}" has been received and is pending review.`
    });
    await reporterUser.save();
  }

  return ApiResponse.success(res, 'Report submitted successfully.', report, HTTP_STATUS.CREATED);
});

/**
 * Fetch reports submitted by the logged-in user
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const reporterId = req.user._id;

  const reports = await Report.find({ reporter: reporterId })
    .populate('reportedUser', 'name email status branch university')
    .sort({ createdAt: -1 });

  return ApiResponse.success(res, 'My reports history fetched successfully', reports, HTTP_STATUS.OK);
});

/**
 * Fetch all reports with filtering/searching (Admin Only)
 */
export const getAdminReports = asyncHandler(async (req, res) => {
  const { status, reason, search, page = 1, limit = 10, sortBy = 'newest' } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (reason) {
    query.reason = reason;
  }

  // User search logic
  if (search) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');

    const userIds = matchingUsers.map(u => u._id);

    query.$or = [
      { reporter: { $in: userIds } },
      { reportedUser: { $in: userIds } }
    ];
  }

  const sortOption = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = (parsedPage - 1) * parsedLimit;

  const items = await Report.find(query)
    .populate('reporter', 'name email status university')
    .populate('reportedUser', 'name email status warningsCount university')
    .sort(sortOption)
    .skip(skip)
    .limit(parsedLimit);

  const total = await Report.countDocuments(query);
  const pages = Math.ceil(total / parsedLimit);

  return ApiResponse.success(res, 'Reports list fetched successfully', {
    items,
    total,
    page: parsedPage,
    pages
  }, HTTP_STATUS.OK);
});

/**
 * Moderate report, warn, or block user (Admin Only)
 */
export const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, status, adminNote } = req.body;
  const adminId = req.user._id;

  const report = await Report.findById(id)
    .populate('reporter', 'name email notifications')
    .populate('reportedUser', 'name email status role warningsCount notifications');

  if (!report) {
    return ApiResponse.error(res, 'Report ticket not found.', [], HTTP_STATUS.NOT_FOUND);
  }

  // Admin account protection check
  if (['warn', 'disable', 'ban'].includes(action) && report.reportedUser?.role === 'Admin') {
    return ApiResponse.error(res, 'Security protection: Administrative accounts cannot be moderated.', [], HTTP_STATUS.FORBIDDEN);
  }

  // 1. Warn User
  if (action === 'warn') {
    const user = report.reportedUser;
    if (!user) {
      return ApiResponse.error(res, 'Reported user profile no longer exists.', [], HTTP_STATUS.NOT_FOUND);
    }
    user.warningsCount = (user.warningsCount || 0) + 1;
    user.notifications.push({
      message: `Your account received a warning from administration. (Total warnings: ${user.warningsCount})`
    });
    await user.save();

    report.moderationHistory.push({
      action: 'Warning Issued',
      admin: adminId,
      notes: adminNote || 'Official warning sent by moderator.'
    });
    await report.save();

    return ApiResponse.success(res, 'Warning issued successfully', report, HTTP_STATUS.OK);
  }

  // 2. Disable User
  if (action === 'disable') {
    const user = report.reportedUser;
    if (!user) {
      return ApiResponse.error(res, 'Reported user profile no longer exists.', [], HTTP_STATUS.NOT_FOUND);
    }

    if (user._id.toString() === adminId.toString()) {
      return ApiResponse.error(res, 'You cannot disable your own admin account.', [], HTTP_STATUS.BAD_REQUEST);
    }

    if (user.role === 'Admin') {
      const activeAdmins = await User.countDocuments({ role: 'Admin', status: 'active' });
      if (activeAdmins <= 1 && user.status === 'active') {
        return ApiResponse.error(res, 'Cannot disable the last active administrator account.', [], HTTP_STATUS.BAD_REQUEST);
      }
    }

    user.status = 'disabled';
    user.notifications.push({
      message: 'Your account has been temporarily disabled.'
    });
    await user.save();

    report.moderationHistory.push({
      action: 'Account Disabled',
      admin: adminId,
      notes: adminNote || 'Account disabled by moderator.'
    });
    await report.save();

    return ApiResponse.success(res, 'User account disabled successfully', report, HTTP_STATUS.OK);
  }

  // 3. Ban User
  if (action === 'ban') {
    const user = report.reportedUser;
    if (!user) {
      return ApiResponse.error(res, 'Reported user profile no longer exists.', [], HTTP_STATUS.NOT_FOUND);
    }

    if (user._id.toString() === adminId.toString()) {
      return ApiResponse.error(res, 'You cannot ban your own admin account.', [], HTTP_STATUS.BAD_REQUEST);
    }

    if (user.role === 'Admin') {
      const activeAdmins = await User.countDocuments({ role: 'Admin', status: 'active' });
      if (activeAdmins <= 1 && user.status === 'active') {
        return ApiResponse.error(res, 'Cannot ban the last active administrator account.', [], HTTP_STATUS.BAD_REQUEST);
      }
    }

    user.status = 'banned';
    user.notifications.push({
      message: 'Your account has been permanently banned.'
    });
    await user.save();

    report.moderationHistory.push({
      action: 'Account Banned',
      admin: adminId,
      notes: adminNote || 'Account permanently banned.'
    });
    await report.save();

    return ApiResponse.success(res, 'User account banned successfully', report, HTTP_STATUS.OK);
  }

  // 4. Update Report Status (Resolved / Rejected / Under Review)
  if (status) {
    report.status = status;
  }
  if (adminNote !== undefined) {
    report.adminNote = adminNote;
  }

  let transition = 'reviewed';
  if (status === 'Under Review') {
    transition = 'under review';
  } else if (status === 'Resolved') {
    transition = 'resolved';
  } else if (status === 'Rejected') {
    transition = 'rejected';
  }

  if (report.reporter) {
    report.reporter.notifications.push({
      message: `Your report against "${report.reportedUser?.name || 'User'}" has been ${transition}.`
    });
    await report.reporter.save();
  }

  report.moderationHistory.push({
    action: `Status updated to: ${status}`,
    admin: adminId,
    notes: adminNote || `Report marked as ${status}`
  });

  await report.save();

  return ApiResponse.success(res, 'Report ticket modified successfully', report, HTTP_STATUS.OK);
});

/**
 * Fetch current user notifications
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], HTTP_STATUS.NOT_FOUND);
  }

  return ApiResponse.success(res, 'Notifications fetched successfully', user.notifications || [], HTTP_STATUS.OK);
});

/**
 * Clear notifications
 */
export const clearUserNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], HTTP_STATUS.NOT_FOUND);
  }

  user.notifications = [];
  await user.save();

  return ApiResponse.success(res, 'Notifications cleared successfully', [], HTTP_STATUS.OK);
});

/**
 * Mark a single notification as read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], HTTP_STATUS.NOT_FOUND);
  }

  const notification = user.notifications.id(req.params.id);
  if (!notification) {
    return ApiResponse.error(res, 'Notification not found', [], HTTP_STATUS.NOT_FOUND);
  }

  notification.read = true;
  await user.save();

  return ApiResponse.success(res, 'Notification marked as read', user.notifications, HTTP_STATUS.OK);
});

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return ApiResponse.error(res, 'User not found', [], HTTP_STATUS.NOT_FOUND);
  }

  user.notifications.forEach(n => {
    n.read = true;
  });
  await user.save();

  return ApiResponse.success(res, 'All notifications marked as read', user.notifications, HTTP_STATUS.OK);
});
