import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password || !age) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (parseInt(age) < 13) {
      return res.status(400).json({ error: 'You must be at least 13 years old' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      age: parseInt(age),
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        isEmailVerified: user.isEmailVerified,
        userStats: user.userStats,
        safetySettings: user.safetySettings
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        isEmailVerified: user.isEmailVerified,
        userStats: user.userStats,
        safetySettings: user.safetySettings
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send(`
        <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
          <h1>❌ Invalid or expired verification link</h1>
          <p>Please register again or contact support.</p>
        </body></html>
      `);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (e) {
      console.error('Welcome email failed:', e.message);
    }

    res.send(`
      <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
        <h1 style="color:#a855f7">🌲 MindfulTech</h1>
        <h2>✅ Email Verified Successfully!</h2>
        <p style="color:#94a3b8">Your account is now active. You can close this page and login to the app.</p>
      </body></html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If this email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Reset email failed:', emailError.message);
      return res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send(`
        <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
          <h1>❌ Invalid or expired reset link</h1>
          <p>Please request a new password reset.</p>
        </body></html>
      `);
    }

    res.send(`
      <html>
      <body style="background:#0f0f23;color:#fff;font-family:Arial;padding:40px;max-width:400px;margin:0 auto">
        <h1 style="color:#a855f7;text-align:center">🌲 MindfulTech</h1>
        <h2 style="text-align:center">Reset Password</h2>
        <form method="POST" action="/api/auth/reset-password">
          <input type="hidden" name="token" value="${req.params.token}" />
          <div style="margin-bottom:16px">
            <label style="color:#94a3b8;display:block;margin-bottom:8px">New Password</label>
            <input type="password" name="newPassword" required minlength="6"
              style="width:100%;padding:14px;background:#1e293b;color:#fff;border:1px solid #334155;border-radius:10px;font-size:16px;box-sizing:border-box" />
          </div>
          <div style="margin-bottom:24px">
            <label style="color:#94a3b8;display:block;margin-bottom:8px">Confirm Password</label>
            <input type="password" name="confirmPassword" required minlength="6"
              style="width:100%;padding:14px;background:#1e293b;color:#fff;border:1px solid #334155;border-radius:10px;font-size:16px;box-sizing:border-box" />
          </div>
          <button type="submit"
            style="width:100%;padding:16px;background:#7c3aed;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer">
            Reset Password
          </button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password Submit
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).send(`
        <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
          <h1>❌ Passwords do not match</h1>
          <a href="javascript:history.back()" style="color:#a855f7">Go back</a>
        </body></html>
      `);
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send(`
        <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
          <h1>❌ Invalid or expired reset link</h1>
        </body></html>
      `);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.send(`
      <html><body style="background:#0f0f23;color:#fff;font-family:Arial;text-align:center;padding:40px">
        <h1 style="color:#a855f7">🌲 MindfulTech</h1>
        <h2>✅ Password Reset Successfully!</h2>
        <p style="color:#94a3b8">You can now login with your new password.</p>
      </body></html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;