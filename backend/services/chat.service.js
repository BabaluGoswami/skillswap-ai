import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import SwapRequest from '../models/SwapRequest.js';

class ChatService {
  /**
   * Assures that an Accepted skill swap request exists between the two users.
   */
  async validateAcceptedSwap(user1, user2) {
    const swap = await SwapRequest.findOne({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ],
      status: { $in: ['Accepted', 'CompletionRequested', 'Completed'] }
    });

    if (!swap) {
      throw new Error('Unauthorized: You can only message students with whom you have an Accepted skill swap.');
    }
    return swap;
  }

  /**
   * Creates a message (text or attachment).
   */
  async createMessage(senderId, receiverId, payload) {
    const { text, messageType, attachmentUrl, fileName, fileSize, mimeType, publicId, resource_type } = payload;

    // 1. Enforce active swap request
    const swap = await this.validateAcceptedSwap(senderId, receiverId);
    if (swap.status === 'Completed') {
      throw new Error('Unauthorized: You cannot send messages in a completed learning session.');
    }

    // 2. Get or create conversation
    let conv = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    // 3. Create the message
    const message = await Message.create({
      conversationId: conv._id,
      sender: senderId,
      text: text || '',
      messageType: messageType || 'text',
      attachmentUrl: attachmentUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
      mimeType: mimeType || '',
      publicId: publicId || '',
      resource_type: resource_type || ''
    });

    // 4. Update latest conversation activity details
    conv.lastMessage = message._id;
    await conv.save();

    return await Message.findById(message._id)
      .populate('sender', 'name profileImage university branch');
  }

  /**
   * Compatibility wrapper for text messages.
   */
  async sendMessage(senderId, receiverId, text, messageType = 'text', attachmentUrl = '') {
    return this.createMessage(senderId, receiverId, {
      text,
      messageType,
      attachmentUrl
    });
  }

  /**
   * Validates if a user is a participant of a conversation and returns the conversation object.
   */
  async validateParticipantAndGetConversation(conversationId, userId) {
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      throw new Error('Conversation not found.');
    }

    const isParticipant = conv.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      throw new Error('Unauthorized: You are not a participant in this conversation.');
    }
    return conv;
  }

  async getMessages(conversationId, userId, limit = 30, beforeTimestamp = null) {
    const conv = await this.validateParticipantAndGetConversation(conversationId, userId);

    // Verify swap validation remains active
    const peerId = conv.participants.find(p => p.toString() !== userId.toString());
    await this.validateAcceptedSwap(userId, peerId);

    // Query filter
    const query = { conversationId };
    if (beforeTimestamp) {
      query.createdAt = { $lt: new Date(beforeTimestamp) };
    }

    // Paginate messages (latest first, limit then reverse)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name profileImage university branch');

    // Reverse for chronological ordering
    messages.reverse();

    // Mark unread incoming messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    return messages;
  }

  /**
   * Retrieves all conversations user is in, carrying unread counts and latest message.
   */
  async getConversations(userId) {
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name profileImage university branch')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    const results = [];
    for (const conv of conversations) {
      // Filter out self-referencing entries from participants detail
      const peer = conv.participants.find(p => p._id.toString() !== userId.toString());
      if (!peer) continue; // safety guard

      // Verify that there is still an active accepted swap request.
      // (If a swap is cancelled/rejected later, do not return in matches/chat conversations listing)
      const hasSwap = await SwapRequest.findOne({
        $or: [
          { sender: userId, receiver: peer._id },
          { sender: peer._id, receiver: userId }
        ],
        status: { $in: ['Accepted', 'CompletionRequested', 'Completed'] }
      });

      if (!hasSwap) continue;

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        sender: { $ne: userId },
        read: false
      });

      results.push({
        conversationId: conv._id,
        peer: {
          id: peer._id,
          name: peer.name,
          profileImage: peer.profileImage,
          university: peer.university,
          branch: peer.branch,
        },
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      });
    }

    return results;
  }
}

export default new ChatService();
