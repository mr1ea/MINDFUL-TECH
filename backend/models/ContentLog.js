import mongoose from 'mongoose';

const contentLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['harmful', 'educational', 'explicit', 'entertaining', 'news', 'social_media', 'productive', 'neutral'],
    default: 'neutral'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  reason: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Legacy fields for compatibility
  platform: {
    type: String,
    default: 'Other'
  },
  duration: {
    type: Number,
    default: 0
  },
  flagged: {
    type: Boolean,
    default: false
  },
  harmful: {
    type: Boolean,
    default: false
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  }
}, {
  timestamps: true
});
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