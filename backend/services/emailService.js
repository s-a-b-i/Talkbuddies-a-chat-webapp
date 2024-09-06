// services/emailService.js

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Talkbuddies" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Your App!';
  const html = `
    <h1>Welcome, ${user.firstName}!</h1>
    <p>Thank you for signing up with Your App. We're excited to have you on board!</p>
    <p>If you have any questions, feel free to reply to this email.</p>
  `;
  await sendEmail(user.email, subject, html);
};

export const sendFirstLoginEmail = async (user) => {
  const subject = 'First Login Detected';
  const html = `
    <h1>Hello, ${user.firstName}!</h1>
    <p>We've detected your first login to Your App. Welcome back!</p>
    <p>If this wasn't you, please contact our support team immediately.</p>
  `;
  await sendEmail(user.email, subject, html);
};

export const sendGoogleLoginEmail = async (user) => {
  const subject = 'Google Login Detected';
  const html = `
    <h1>Hello, ${user.firstName}!</h1>
    <p>You've successfully logged in to Your App using your Google account.</p>
    <p>If this wasn't you, please contact our support team immediately.</p>
  `;
  await sendEmail(user.email, subject, html);
};