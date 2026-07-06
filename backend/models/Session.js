import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
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
  swapRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Pending',
    index: true,
  }
}, {
  timestamps: true,
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
