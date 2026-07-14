import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Prevents sending hash in standard queries
  },
  role: {
    type: String,
    enum: ['Student', 'Mentor', 'Admin'],
    default: 'Student',
  },
  status: {
    type: String,
    enum: ['active', 'disabled', 'banned', 'deleted'],
    default: 'active',
    index: true,
  },
  skillsToTeach: [{
    type: String,
    trim: true,
  }],
  skillsToLearn: [{
    type: String,
    trim: true,
  }],
  ratingAverage: {
    type: Number,
    default: 0.0,
  },
  totalSessions: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalTeachingHours: {
    type: Number,
    default: 0,
  },
  university: {
    type: String,
    trim: true,
    default: '',
  },
  branch: {
    type: String,
    trim: true,
    default: '',
  },
  year: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [250, 'Bio cannot exceed 250 characters'],
    default: '',
  },
  github: {
    type: String,
    trim: true,
    default: '',
  },
  linkedin: {
    type: String,
    trim: true,
    default: '',
  },
  portfolio: {
    type: String,
    trim: true,
    default: '',
  },
  availability: {
    type: String,
    trim: true,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  profileImagePublicId: {
    type: String,
    default: '',
  },
  warningsCount: {
    type: Number,
    default: 0,
  },
  warnings: [{
    reason: { type: String, required: true },
    adminNote: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  }],
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  notifications: [{
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

// Pre-save middleware to hash passwords automatically before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password match
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
