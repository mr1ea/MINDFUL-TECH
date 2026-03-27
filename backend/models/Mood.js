import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  note: {
    type: String,
    default: ''
  },
  screenTime: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Mood', moodSchema);