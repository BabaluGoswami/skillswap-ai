import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['Spam', 'Fake Profile', 'Harassment', 'Abusive Behaviour', 'Inappropriate Content', 'Scam', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000
  },
  screenshot: {
    type: String,
    default: ''
  },
  screenshotPublicId: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  moderationHistory: [{
    action: {
      type: String,
      required: true
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for optimal filtering and populates
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reason: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
