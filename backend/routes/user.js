import express from 'express';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const getUserId = (req) => req.user?.userId || req.userId;

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(getUserId(req)).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.userStats = { ...user.userStats, ...req.body.userStats };
    await user.save();
    res.json({ message: 'Stats updated', userStats: user.userStats });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/safety-settings', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.safetySettings = { ...user.safetySettings, ...req.body.safetySettings };
    await user.save();
    res.json({ message: 'Settings updated', safetySettings: user.safetySettings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/behavior-patterns', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.behaviorPatterns = { ...user.behaviorPatterns, ...req.body.behaviorPatterns };
    await user.save();
    res.json({ message: 'Patterns updated', behaviorPatterns: user.behaviorPatterns });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;