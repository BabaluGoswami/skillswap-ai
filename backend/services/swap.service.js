import SwapRequest from '../models/SwapRequest.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { emitToUser } from './socket.js';
import matchingService from './matching.service.js';

class SwapService {
  /**
   * Converts Mongoose document to plain object, injecting schema-less completedSkills field.
   */
  transformRequest(req) {
    if (!req) return null;
    const obj = req.toObject ? req.toObject() : req;
    obj.completedSkills = req.get ? req.get('completedSkills') : req.completedSkills;
    return obj;
  }

  /**
   * Fetch a populated request.
   */
  async getPopulatedRequest(requestId) {
    const doc = await SwapRequest.findById(requestId)
      .populate('sender receiver', 'name profileImage university branch');
    return this.transformRequest(doc);
  }

  /**
   * Create a new Swap Request.
   */
  async createRequest(senderId, receiverId, message) {
    if (senderId.toString() === receiverId.toString()) {
      throw new Error('You cannot send a skill swap request to yourself.');
    }

    // Bidirectional duplicate Active/Pending request check
    const existingPending = await SwapRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: { $in: ['Pending', 'Accepted', 'CompletionRequested'] }
    });

    if (existingPending) {
      throw new Error('An active or pending swap request already exists between you and this student.');
    }

    // Notify receiver
    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    const swapRequest = await SwapRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      status: 'Pending'
    });

    if (senderUser && receiverUser) {
      receiverUser.notifications.push({
        message: `You received a new skill swap request from "${senderUser.name}".`
      });
      await receiverUser.save();
      emitToUser(receiverId, 'notification_update', { unreadCount: receiverUser.notifications.filter(n => !n.read).length });
    }

    return await this.getPopulatedRequest(swapRequest._id);
  }

  /**
   * Accept a Swap Request (only by receiver).
   */
  async acceptRequest(requestId, receiverId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'Pending') {
      throw new Error(`Cannot accept request. Current status is already "${request.status}".`);
    }

    if (request.receiver.toString() !== receiverId.toString()) {
      throw new Error('Unauthorized: Only the recipient can accept this swap request.');
    }

    request.status = 'Accepted';
    await request.save();

    // Notify sender
    const senderUser = await User.findById(request.sender);
    const receiverUser = await User.findById(request.receiver);
    if (senderUser && receiverUser) {
      senderUser.notifications.push({
        message: `Your skill swap request sent to "${receiverUser.name}" has been accepted!`
      });
      await senderUser.save();
      emitToUser(request.sender, 'notification_update', { unreadCount: senderUser.notifications.filter(n => !n.read).length });
    }

    // Automatically create a Conversation if one does not already exist
    let conv = await Conversation.findOne({
      participants: { $all: [request.sender, request.receiver] }
    });

    if (!conv) {
      await Conversation.create({
        participants: [request.sender, request.receiver]
      });
    }

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Reject a Swap Request (only by receiver).
   */
  async rejectRequest(requestId, receiverId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'Pending') {
      throw new Error(`Cannot reject request. Current status is already "${request.status}".`);
    }

    if (request.receiver.toString() !== receiverId.toString()) {
      throw new Error('Unauthorized: Only the recipient can reject this swap request.');
    }

    request.status = 'Rejected';
    await request.save();

    // Notify sender
    const senderUser2 = await User.findById(request.sender);
    const receiverUser2 = await User.findById(request.receiver);
    if (senderUser2 && receiverUser2) {
      senderUser2.notifications.push({
        message: `Your skill swap request sent to "${receiverUser2.name}" has been rejected.`
      });
      await senderUser2.save();
      emitToUser(request.sender, 'notification_update', { unreadCount: senderUser2.notifications.filter(n => !n.read).length });
    }

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Cancel a Swap Request (only by sender).
   */
  async cancelRequest(requestId, senderId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'Pending') {
      throw new Error(`Cannot cancel request. Current status is already "${request.status}".`);
    }

    if (request.sender.toString() !== senderId.toString()) {
      throw new Error('Unauthorized: Only the sender can cancel this swap request.');
    }

    request.status = 'Cancelled';
    await request.save();

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Request session completion (by either participant acting as mentor).
   */
  async requestCompletion(requestId, userId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'Accepted') {
      throw new Error('Only active accepted sessions can be completed.');
    }

    const isParticipant = request.sender.toString() === userId.toString() || request.receiver.toString() === userId.toString();
    if (!isParticipant) {
      throw new Error('Unauthorized: You are not a participant in this learning session.');
    }

    request.status = 'CompletionRequested';
    request.completionRequestedBy = userId;
    await request.save();

    // Identify the student (the other participant) and notify them
    const otherParticipantId = request.sender.toString() === userId.toString() ? request.receiver : request.sender;
    const studentUser = await User.findById(otherParticipantId);
    if (studentUser) {
      studentUser.notifications.push({
        message: 'Your mentor has requested to complete this learning session.'
      });
      await studentUser.save();
      emitToUser(otherParticipantId, 'notification_update', { unreadCount: studentUser.notifications.filter(n => !n.read).length });
    }

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Accept session completion.
   */
  async acceptCompletion(requestId, userId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'CompletionRequested') {
      throw new Error('No completion request found for this session.');
    }

    const isParticipant = request.sender.toString() === userId.toString() || request.receiver.toString() === userId.toString();
    if (!isParticipant) {
      throw new Error('Unauthorized: You are not a participant in this learning session.');
    }

    request.status = 'Completed';
    request.completionRequestedBy = null;
    await request.save();

    // Increase totalSessions and XP for both participants
    const user1 = await User.findById(request.sender);
    const user2 = await User.findById(request.receiver);

    if (user1) {
      user1.totalSessions = (user1.totalSessions || 0) + 1;
      user1.xp = (user1.xp || 0) + 100;
      user1.level = Math.floor(user1.xp / 500) + 1;
      user1.notifications.push({
        message: 'Learning session completed successfully! You earned 100 XP.'
      });
      await user1.save();
      emitToUser(request.sender, 'notification_update', { unreadCount: user1.notifications.filter(n => !n.read).length });
    }

    if (user2) {
      user2.totalSessions = (user2.totalSessions || 0) + 1;
      user2.xp = (user2.xp || 0) + 100;
      user2.level = Math.floor(user2.xp / 500) + 1;
      user2.notifications.push({
        message: 'Learning session completed successfully! You earned 100 XP.'
      });
      await user2.save();
      emitToUser(request.receiver, 'notification_update', { unreadCount: user2.notifications.filter(n => !n.read).length });
    }

    // Save completed skills to MongoDB
    let matchingSkills = [];
    if (user1 && user2) {
      const matchResult = matchingService.calculateMatchScore(user1, user2);
      matchingSkills = [...(matchResult.commonTeachSkills || []), ...(matchResult.commonLearnSkills || [])];
    }
    request.completedSkills = matchingSkills;
    await request.save();

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Reject session completion.
   */
  async rejectCompletion(requestId, userId) {
    const request = await SwapRequest.findById(requestId);
    if (!request) {
      throw new Error('Swap request not found.');
    }

    if (request.status !== 'CompletionRequested') {
      throw new Error('No completion request found for this session.');
    }

    const isParticipant = request.sender.toString() === userId.toString() || request.receiver.toString() === userId.toString();
    if (!isParticipant) {
      throw new Error('Unauthorized: You are not a participant in this learning session.');
    }

    request.status = 'Accepted';
    request.completionRequestedBy = null;
    await request.save();

    // Notify the other participant (the mentor who requested completion)
    const otherParticipantId = request.sender.toString() === userId.toString() ? request.receiver : request.sender;
    const mentorUser = await User.findById(otherParticipantId);
    if (mentorUser) {
      mentorUser.notifications.push({
        message: 'Your student has rejected the learning session completion request.'
      });
      await mentorUser.save();
      emitToUser(otherParticipantId, 'notification_update', { unreadCount: mentorUser.notifications.filter(n => !n.read).length });
    }

    return await this.getPopulatedRequest(request._id);
  }

  /**
   * Fetch sent swap requests.
   */
  async getSentRequests(senderId) {
    return await SwapRequest.find({ sender: senderId })
      .populate('sender receiver', 'name profileImage university branch')
      .sort({ createdAt: -1 });
  }

  /**
   * Fetch received swap requests.
   */
  async getReceivedRequests(receiverId) {
    return await SwapRequest.find({ receiver: receiverId })
      .populate('sender receiver', 'name profileImage university branch')
      .sort({ createdAt: -1 });
  }
}

export default new SwapService();
