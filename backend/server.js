import dotenv from 'dotenv';
dotenv.config(); // ✅ Must be before anything else

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import contentRoutes from './routes/content.js';
import moodRoutes from './routes/mood.js';
import focusRoutes from './routes/focus.js';

const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Test endpoint to verify POST handling without touching auth logic
app.post('/api/test-post', (req, res) => {
  console.log('[/api/test-post] body:', req.body);
  res.json({ ok: true, received: req.body });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/focus', focusRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindfultech';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.json({ message: 'MindfulTech API Server Running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Global error handlers to catch crashes and log them
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Optionally exit process after logging
});