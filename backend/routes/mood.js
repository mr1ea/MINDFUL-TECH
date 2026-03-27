import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Mood from '../models/Mood.js';

const router = express.Router();

// Log mood entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { mood, note, screenTime } = req.body;

    // Validation
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: 'Mood must be between 1 and 5' });
    }

    const moodEntry = new Mood({
      userId: req.userId,
      mood,
      note: note || '',
      screenTime: screenTime || 0
    });

    await moodEntry.save();
    res.status(201).json({ message: 'Mood logged successfully', mood: moodEntry });
  } catch (error) {
    console.error('Mood log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's mood history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 30, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await Mood.find({
      userId: req.userId,
      timestamp: { $gte: startDate }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(moods);
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get mood statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await Mood.find({
      userId: req.userId,
      timestamp: { $gte: startDate }
    });

    if (moods.length === 0) {
      return res.json({
        averageMood: 0,
        totalEntries: 0,
        moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        trend: 'stable',
        weeklyAverage: 0
      });
    }

    // Calculate average mood
    const totalMood = moods.reduce((sum, entry) => sum + entry.mood, 0);
    const averageMood = (totalMood / moods.length).toFixed(2);

    // Mood distribution
    const moodDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moods.forEach(entry => {
      moodDistribution[entry.mood]++;
    });

    // Calculate trend (comparing first half vs second half)
    const midpoint = Math.floor(moods.length / 2);
    const firstHalf = moods.slice(0, midpoint);
    const secondHalf = moods.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, e) => sum + e.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.mood, 0) / secondHalf.length;
    
    let trend = 'stable';
    if (secondAvg > firstAvg + 0.3) trend = 'improving';
    else if (secondAvg < firstAvg - 0.3) trend = 'declining';

    // Screen time correlation
    const avgScreenTime = moods.reduce((sum, e) => sum + e.screenTime, 0) / moods.length;

    res.json({
      averageMood: parseFloat(averageMood),
      totalEntries: moods.length,
      moodDistribution,
      trend,
      weeklyAverage: parseFloat(averageMood),
      averageScreenTime: Math.round(avgScreenTime),
      recentMoods: moods.slice(0, 7).map(m => ({
        mood: m.mood,
        date: m.timestamp
      }))
    });
  } catch (error) {
    console.error('Mood stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete mood entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!mood) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }

    await Mood.deleteOne({ _id: req.params.id });
    res.json({ message: 'Mood entry deleted' });
  } catch (error) {
    console.error('Delete mood error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;