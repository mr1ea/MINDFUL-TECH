import express from 'express';
import ContentLog from '../models/ContentLog.js';
import auth from '../middleware/auth.js';
import { analyzeContent, analyzeScreenshot } from '../services/aiAnalysis.js';
import crypto from 'crypto';

const router = express.Router();

// Helper to get userId from either middleware pattern
const getUserId = (req) => req.user?.userId || req.userId;

// Hash URL for privacy
const hashUrl = (url) => {
  return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16); // Short hash
};

// Analyze content with AI
router.post('/analyze', auth, async (req, res) => {
  try {
    const { contentInput } = req.body;
    if (!contentInput) {
      return res.status(400).json({ error: 'Content input is required' });
    }
    const analysis = await analyzeContent(contentInput);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze screenshot with AI vision
router.post('/analyze-screenshot', auth, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const analysis = await analyzeScreenshot(imageBase64);

    if (analysis.success && analysis.analysis.category !== 'other') {
      const contentLog = new ContentLog({
        userId: getUserId(req),
        platform: analysis.analysis.platform || 'Unknown',
        category: analysis.analysis.category,
        duration: 1,
        flagged: analysis.analysis.harmful,
        note: analysis.analysis.description
      });
      await contentLog.save();
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capture content from extension
router.post('/capture', auth, async (req, res) => {
  try {
    const { url, title, text, timestamp } = req.body;
    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }

    // Hash or truncate URL for privacy
    const hashedUrl = hashUrl(url);

    // Analyze content with AI
    const analysis = await analyzeContent(text || title);

    const contentLog = new ContentLog({
      userId: getUserId(req),
      url: hashedUrl,
      title,
      text: text ? text.substring(0, 500) : '', // Truncate for storage
      category: analysis.category,
      confidence: analysis.confidence,
      reason: analysis.reason,
      timestamp: new Date(timestamp),
      harmful: analysis.category === 'harmful' || analysis.category === 'explicit',
      riskLevel: analysis.category === 'harmful' ? 'high' : analysis.category === 'explicit' ? 'high' : 'low'
    });

    await contentLog.save();

    // Check for alerts
    if (contentLog.harmful) {
      // Trigger notification (implement later)
    }

    res.json({ success: true, category: analysis.category, confidence: analysis.confidence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log content
router.post('/', auth, async (req, res) => {
  try {
    const { platform, category, duration, note } = req.body;
    if (!platform || !category || !duration) {
      return res.status(400).json({ error: 'Platform, category, and duration are required' });
    }

    const harmful = ['harmful', 'inappropriate'].includes(category);

    const contentLog = new ContentLog({
      userId: getUserId(req),
      platform,
      category,
      duration,
      flagged: harmful,
      note: note || ''
    });

    await contentLog.save();
    res.json({ success: true, contentLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content logs
router.get('/', auth, async (req, res) => {
  try {
    const logs = await ContentLog.find({ userId: getUserId(req) })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get platform summary
router.get('/summary', auth, async (req, res) => {
  try {
    const logs = await ContentLog.find({ userId: getUserId(req) });

    const summary = {};
    logs.forEach(log => {
      if (!summary[log.platform]) {
        summary[log.platform] = { time: 0, risk: 'low', lastUsed: log.timestamp };
      }
      summary[log.platform].time += log.duration;
      if (log.flagged) summary[log.platform].risk = 'high';
      if (new Date(log.timestamp) > new Date(summary[log.platform].lastUsed)) {
        summary[log.platform].lastUsed = log.timestamp;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;