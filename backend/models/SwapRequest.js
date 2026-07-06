import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
    default: 'Pending',
    required: true,
    index: true,
  },
  message: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true,
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;
