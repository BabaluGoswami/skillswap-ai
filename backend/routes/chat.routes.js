import express from 'express';
import { getConversations, getMessages, sendMessage, uploadAttachment } from '../controllers/chat.controller.js';
import protect from '../middlewares/auth.js';
import chatUpload from '../middlewares/chatUpload.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);
router.post('/message', sendMessage);
router.post('/upload', chatUpload.single('file'), uploadAttachment);

export default router;
