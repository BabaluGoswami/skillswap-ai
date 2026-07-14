import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import storageService from './storage.service.js';

class FeedbackService {
  /**
   * Submits new feedback with rate limits and duplicate checks.
   */
  async createFeedback(userId, data, file) {
    const { title, description, type, rating, pageUrl, routeName, browser, platform, screenResolution } = data;

    // Teacher Rating Validation and Duplicate Check
    if (title && title.trim() === 'Teacher Rating') {
      let metadata;
      try {
        metadata = JSON.parse(description);
      } catch (e) {
        throw new Error('Invalid rating description metadata format.');
      }

      if (!metadata.swapRequestId || !metadata.teacherId) {
        throw new Error('Missing swapRequestId or teacherId in rating metadata.');
      }

      if (userId.toString() === metadata.teacherId.toString()) {
        throw new Error('Security protection: You cannot rate yourself.');
      }

      const existing = await Feedback.findOne({
        title: 'Teacher Rating',
        description: { $regex: metadata.swapRequestId }
      });
      if (existing) {
        throw new Error('Duplicate rating: You have already rated the teacher for this session.');
      }
    } else {
      // 1. Daily Rate Limit Check (max 5 per user per calendar day in server timezone)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const submissionsToday = await Feedback.countDocuments({
        user: userId,
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });

      if (submissionsToday >= 5) {
        throw new Error('Rate limit exceeded: You can submit a maximum of 5 feedback reports per day.');
      }

      // 2. Duplicate Check (reject same title + description submitted within 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const isDuplicate = await Feedback.findOne({
        user: userId,
        title: title.trim(),
        description: description.trim(),
        createdAt: { $gte: tenMinutesAgo }
      });

      if (isDuplicate) {
        throw new Error('Duplicate submission detected: You submitted the same title and description in the last 10 minutes.');
      }
    }

    // 3. Optional Screenshot Upload using existing storageService
    let screenshotUrl = '';
    let screenshotPublicId = '';

    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File validation error: Screenshot size cannot exceed 5MB.');
      }
      
      // Validate file format
      const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
      const extension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        throw new Error('File validation error: Only PNG, JPG, JPEG, and WebP screenshots are allowed.');
      }

      // Save using Cloudinary integration
      const uploadResult = await storageService.saveFile(file.buffer, file.originalname);
      screenshotUrl = uploadResult.secure_url;
      screenshotPublicId = uploadResult.public_id;
    }

    // 4. Create and Save model
    const feedback = new Feedback({
      user: userId,
      rating,
      type,
      title: title.trim(),
      description: description.trim(),
      pageUrl,
      routeName,
      browser,
      platform,
      screenResolution,
      screenshot: screenshotUrl,
      screenshotPublicId,
      status: 'Open'
    });

    await feedback.save();

    // If it is a Teacher Rating, update the teacher's User stats
    if (feedback.title === 'Teacher Rating') {
      try {
        const metadata = JSON.parse(feedback.description);
        const teacher = await User.findById(metadata.teacherId);
        if (teacher) {
          // Find all teacher ratings feedbacks
          const feedbacks = await Feedback.find({
            title: 'Teacher Rating',
            description: { $regex: metadata.teacherId }
          });
          const totalRatings = feedbacks.length;
          const averageRating = totalRatings > 0
            ? parseFloat((feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1))
            : 0;
          teacher.ratingAverage = averageRating;
          teacher.totalRatings = totalRatings;
          await teacher.save();
        }
      } catch (err) {
        console.error('Error updating teacher rating stats:', err.message);
      }
    }

    return feedback;
  }

  /**
   * Retrieves paginated list of feedback submitted by a specific user.
   */
  async getMyFeedback(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const items = await Feedback.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ user: userId });

    return {
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }
}

export default new FeedbackService();
