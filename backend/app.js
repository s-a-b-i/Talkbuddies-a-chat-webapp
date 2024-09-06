// app.js

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { authRouter } from "./routes/Auth.routes.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { csrfProtection } from "./middlewares/csrfProtection.js";
import { securityHeaders } from "./middlewares/securityHeaders.js";
import { configurePassport } from './config/passport.js';

const app = express();

dotenv.config();

// Enable CORS with credentials
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware with size limits for security
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
configurePassport();

// Apply general rate limits across the application
app.use(generalLimiter);

// Apply security headers globally using Helmet
app.use(securityHeaders);

// Enable CSRF protection globally
app.use(csrfProtection);

// Logging middleware to track incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Use authentication routes under /api/v1/auth
app.use("/api/v1/auth", authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      error: "Invalid CSRF token. Please try refreshing the page and submitting the form again.",
    });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

export { app };