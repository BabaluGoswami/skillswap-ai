import chatService from '../services/chat.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import asyncHandler from '../utils/asyncHandler.js';
import { onlineUsers } from '../services/socket.js';
import chatStorageService from '../services/chatStorage.service.js';
import path from 'path';

/**
 * Fetch all conversations of the authenticated user.
 * GET /api/chat/conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await chatService.getConversations(userId);

  // Inject online status parameter in results dynamically
  const enriched = conversations.map(conv => {
    const isOnline = onlineUsers.has(conv.peer.id.toString());
    return {
      ...conv,
      peer: {
        ...conv.peer,
        isOnline
      }
    };
  });

  return ApiResponse.success(
    res,
    'Conversations fetched successfully.',
    { conversations: enriched },
    HTTP_STATUS.OK
  );
});

/**
 * Fetch messages for a specific conversation (paginated).
 * GET /api/chat/:conversationId/messages
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const { limit, before } = req.query;

  const parsedLimit = parseInt(limit, 10) || 30;

  try {
    const messages = await chatService.getMessages(conversationId, userId, parsedLimit, before);
    return ApiResponse.success(
      res,
      'Messages fetched successfully.',
      { messages },
      HTTP_STATUS.OK
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to fetch messages.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Send a new chat message. Automatically creates a conversation if first message.
 * POST /api/chat/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text, messageType, attachmentUrl } = req.body;
  const senderId = req.user._id;

  try {
    const message = await chatService.sendMessage(
      senderId,
      receiverId,
      text,
      messageType || 'text',
      attachmentUrl || ''
    );

    // Broadcast message via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Emit receive_message to receiver and sender rooms
      io.to(receiverId.toString()).emit('receive_message', message);
      io.to(senderId.toString()).emit('receive_message', message);
    }

    return ApiResponse.success(
      res,
      'Message sent successfully.',
      { message },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      error.message || 'Failed to send message.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});

/**
 * Upload a chat attachment file (Image, Video, Document).
 * Atomic transaction rollback is applied to disk state in case of database errors.
 * POST /api/chat/upload
 */
export const uploadAttachment = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;
  const file = req.file;
  const senderId = req.user._id;

  if (!file) {
    return ApiResponse.error(res, 'No file was uploaded.', [], HTTP_STATUS.BAD_REQUEST);
  }

  if (!conversationId) {
    return ApiResponse.error(res, 'conversationId is required.', [], HTTP_STATUS.BAD_REQUEST);
  }

  // 1. Validate that the sender belongs to the conversation
  let conversation;
  try {
    conversation = await chatService.validateParticipantAndGetConversation(conversationId, senderId);
  } catch (error) {
    return ApiResponse.error(res, error.message, [], HTTP_STATUS.UNAUTHORIZED);
  }

  const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
  if (!receiverId) {
    return ApiResponse.error(res, 'Receiver not found in conversation.', [], HTTP_STATUS.BAD_REQUEST);
  }

  // 2. Validate MIME Type, File Extension, and size limit constraints
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  const fileSize = file.size;

  const ALLOWED_MAPPING = {
    // Images (5 MB limit)
    'image/jpeg': { ext: ['.jpg', '.jpeg'], limit: 5 * 1024 * 1024, type: 'image' },
    'image/png': { ext: ['.png'], limit: 5 * 1024 * 1024, type: 'image' },
    'image/webp': { ext: ['.webp'], limit: 5 * 1024 * 1024, type: 'image' },
    // Videos (25 MB limit)
    'video/mp4': { ext: ['.mp4'], limit: 25 * 1024 * 1024, type: 'video' },
    'video/quicktime': { ext: ['.mov'], limit: 25 * 1024 * 1024, type: 'video' },
    'video/webm': { ext: ['.webm'], limit: 25 * 1024 * 1024, type: 'video' },
    // Documents (10 MB limit)
    'application/pdf': { ext: ['.pdf'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/msword': { ext: ['.doc'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: ['.docx'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/vnd.ms-powerpoint': { ext: ['.ppt'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: ['.pptx'], limit: 10 * 1024 * 1024, type: 'file' },
    'text/plain': { ext: ['.txt'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/zip': { ext: ['.zip'], limit: 10 * 1024 * 1024, type: 'file' },
    'application/x-zip-compressed': { ext: ['.zip'], limit: 10 * 1024 * 1024, type: 'file' }
  };

  const allowedRules = ALLOWED_MAPPING[mimeType];
  if (!allowedRules || !allowedRules.ext.includes(fileExtension)) {
    return ApiResponse.error(
      res,
      `Unsupported file type or extension: ${fileExtension} (${mimeType})`,
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (fileSize > allowedRules.limit) {
    const sizeInMB = (allowedRules.limit / (1024 * 1024)).toFixed(0);
    return ApiResponse.error(
      res,
      `File size exceeds the limit of ${sizeInMB} MB for this file type.`,
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const messageType = allowedRules.type;

  // 3. Save attachment in storage
  let savedFile;
  try {
    savedFile = await chatStorageService.saveAttachment(file);
  } catch (error) {
    return ApiResponse.error(res, 'Failed to save attachment file.', [], HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // 4. Create MongoDB message with Atomic Rollback on exception
  try {
    const message = await chatService.createMessage(senderId, receiverId, {
      text: text || '',
      messageType,
      attachmentUrl: savedFile.attachmentUrl,
      fileName: savedFile.fileName,
      fileSize: savedFile.fileSize,
      mimeType: savedFile.mimeType,
      publicId: savedFile.publicId,
      resource_type: savedFile.resource_type
    });

    // 5. Broadcast message via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('receive_message', message);
      io.to(senderId.toString()).emit('receive_message', message);
    }

    return ApiResponse.success(
      res,
      'Attachment uploaded successfully.',
      { message },
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    // ATOMIC ROLLBACK: delete physical file to prevent orphan uploads
    await chatStorageService.deleteAttachment(savedFile.storedFileName, savedFile.resource_type);

    return ApiResponse.error(
      res,
      error.message || 'Database error during attachment registration.',
      [],
      HTTP_STATUS.BAD_REQUEST
    );
  }
});
