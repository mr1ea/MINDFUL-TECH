import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email/${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"MindfulTech" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '✅ Verify your MindfulTech account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #a855f7; font-size: 32px;">🌲 MindfulTech</h1>
          <p style="color: #94a3b8;">Digital Wellness & Safety</p>
        </div>
        <h2 style="color: #fff;">Hi ${name}! 👋</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          Thanks for registering with MindfulTech. Please verify your email address to activate your account.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
            style="background: linear-gradient(to right, #7c3aed, #ec4899); color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            ✅ Verify My Email
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          This link expires in 24 hours. If you didn't register, ignore this email.
        </p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.APP_URL}/api/auth/reset-password/${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"MindfulTech" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔑 Reset your MindfulTech password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #a855f7; font-size: 32px;">🌲 MindfulTech</h1>
          <p style="color: #94a3b8;">Digital Wellness & Safety</p>
        </div>
        <h2 style="color: #fff;">Hi ${name}! 👋</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          We received a request to reset your password. Click below to create a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
            style="background: linear-gradient(to right, #7c3aed, #ec4899); color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            🔑 Reset My Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"MindfulTech" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🌲 Welcome to MindfulTech!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #a855f7; font-size: 32px;">🌲 MindfulTech</h1>
          <p style="color: #94a3b8;">Digital Wellness & Safety</p>
        </div>
        <h2 style="color: #fff;">Welcome, ${name}! 🎉</h2>
        <p style="color: #94a3b8; line-height: 1.6;">
          Your account has been verified. Here's what you can do with MindfulTech:
        </p>
        <ul style="color: #94a3b8; line-height: 2;">
          <li>📊 Track your mood daily</li>
          <li>⏱️ Use focus timer sessions</li>
          <li>🤖 AI content analysis</li>
          <li>📸 Screen monitoring</li>
          <li>📈 View your wellness analytics</li>
        </ul>
        <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 32px;">
          Stay mindful. Stay healthy. 🌿
        </p>
      </div>
    `
  });
};