import SwapRequest from '../models/SwapRequest.js';
import Conversation from '../models/Conversation.js';

class SwapService {
  /**
   * Helper to populate sender and receiver details.
   */
  async getPopulatedRequest(requestId) {
    return await SwapRequest.findById(requestId)
      .populate('sender receiver', 'name profileImage university branch');
  }

  /**
   * Create a new Swap Request.
   */
  async createRequest(senderId, receiverId, message) {
    if (senderId.toString() === receiverId.toString()) {
      throw new Error('You cannot send a skill swap request to yourself.');
    }

    // Bidirectional duplicate Pending request check
    const existingPending = await SwapRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: 'Pending'
    });

    if (existingPending) {
      throw new Error('An active pending request already exists between you and this student.');
    }

    const swapRequest = await SwapRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      status: 'Pending'
    });

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
