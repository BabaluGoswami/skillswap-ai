import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text',
    required: true,
  },
  attachmentUrl: {
    type: String,
    default: '',
  },
  fileName: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    default: '',
  },
  publicId: {
    type: String,
    default: '',
  },
  resource_type: {
    type: String,
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
