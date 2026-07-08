import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  type: {
    type: String,
    required: true,
    enum: ['Report a Bug', 'Suggest a Feature', 'General Feedback'],
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  pageUrl: {
    type: String,
    required: true,
  },
  routeName: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  screenResolution: {
    type: String,
    required: true,
  },
  screenshot: {
    type: String,
    default: '',
  },
  screenshotPublicId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
    index: true,
  },
  adminNote: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

// Compound indexes to speed up pagination & duplicate check
feedbackSchema.index({ user: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
