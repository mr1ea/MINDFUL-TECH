import mongoose from 'mongoose';

const contentLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Raw input the user described (for AI analysis)
  contentInput: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    required: true,
    enum: ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook', 'Other']
  },
  category: {
    type: String,
    required: true,
    enum: ['educational', 'entertainment', 'social', 'news', 'harmful', 'inappropriate', 'other'],
    default: 'other'
  },
  duration: {
    type: Number,
    required: true,
    default: 0
  },
  flagged: {
    type: Boolean,
    default: false
  },
  // AI Analysis fields
  harmful: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  reason: {
    type: String,
    default: ''
  },
  confidence: {
    type: Number,
    default: 0
  },
  aiAnalyzed: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ContentLog', contentLogSchema);