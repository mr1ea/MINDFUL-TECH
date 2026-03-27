import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 13
  },
  userStats: {
    totalFocusTime: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    ecosystemLevel: { type: Number, default: 1 },
    safetyScore: { type: Number, default: 85 }
  },
  safetySettings: {
    blockHarmfulContent: { type: Boolean, default: true },
    ageRestrictions: { type: Boolean, default: true },
    mentalHealthFilter: { type: Boolean, default: true },
    screenTimeLimit: { type: Number, default: 180 },
    parentalControls: { type: Boolean, default: false }
  },
  behaviorPatterns: {
    usagePattern: { type: String, default: 'balanced' },
    riskLevel: { type: String, default: 'low' },
    addictionScore: { type: Number, default: 0 },
    wellnessScore: { type: Number, default: 1 },
    predictedBurnout: { type: Number, default: 0 }
  },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);