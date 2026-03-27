import express from 'express';
import authMiddleware from '../middleware/auth.js';
import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';

const router = express.Router();

// Start/Log a focus session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { duration, completed } = req.body;

    // Validation
    if (!duration || duration < 1) {
      return res.status(400).json({ error: 'Duration must be at least 1 minute' });
    }

    const focusSession = new FocusSession({
      userId: req.userId,
      duration,
      completed: completed !== undefined ? completed : true
    });

    await focusSession.save();

    // Update user stats if session was completed
    if (completed) {
      const user = await User.findById(req.userId);
      if (user) {
        user.userStats.totalFocusTime += duration;
        user.userStats.sessionsCompleted += 1;
        user.userStats.currentStreak += 1;
        user.userStats.ecosystemLevel = Math.floor(user.userStats.totalFocusTime / 100) + 1;
        await user.save();
      }
    }

    res.status(201).json({ 
      message: 'Focus session logged successfully', 
      session: focusSession 
    });
  } catch (error) {
    console.error('Focus session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's focus sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await FocusSession.find({
      userId: req.userId,
      timestamp: { $gte: startDate }
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get focus statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessions = await FocusSession.find({
      userId: req.userId,
      timestamp: { $gte: startDate }
    });

    const completedSessions = sessions.filter(s => s.completed);
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration = completedSessions.length > 0 
      ? Math.round(totalDuration / completedSessions.length) 
      : 0;

    // Calculate daily breakdown
    const dailyStats = {};
    sessions.forEach(session => {
      const date = new Date(session.timestamp).toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, completed: 0, sessions: 0 };
      }
      dailyStats[date].sessions += 1;
      if (session.completed) {
        dailyStats[date].total += session.duration;
        dailyStats[date].completed += 1;
      }
    });

    // Get user's current stats
    const user = await User.findById(req.userId);

    res.json({
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime: totalDuration,
      averageSessionDuration: averageDuration,
      completionRate: sessions.length > 0 
        ? Math.round((completedSessions.length / sessions.length) * 100) 
        : 0,
      dailyBreakdown: dailyStats,
      userStats: user.userStats,
      last7Days: sessions.slice(0, 7).map(s => ({
        duration: s.duration,
        completed: s.completed,
        date: s.timestamp
      }))
    });
  } catch (error) {
    console.error('Focus stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's focus sessions
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await FocusSession.find({
      userId: req.userId,
      timestamp: { $gte: today }
    }).sort({ timestamp: -1 });

    const totalToday = sessions
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    res.json({
      sessions,
      totalToday,
      sessionsCount: sessions.length
    });
  } catch (error) {
    console.error('Today sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a focus session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await FocusSession.deleteOne({ _id: req.params.id });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;