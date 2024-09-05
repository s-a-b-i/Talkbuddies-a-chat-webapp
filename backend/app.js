import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from 'dotenv';
import { authRouter } from "./routes/Auth.routes.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { csrfProtection } from "./middlewares/csrfProtection.js";
import { securityHeaders } from "./middlewares/securityHeaders.js";

const app = express();

dotenv.config();

// Enable CORS with credentials
app.use(
  cors({
    origin:process.env.CORS_ORIGIN , // Allow CORS from specific origin or use a whitelist array
    credentials: true, // Allow credentials (cookies) in requests
  })
);

// Body parsing middleware with size limits for security
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // Serve static files
app.use(cookieParser()); // Parse cookies

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

// Error handling middleware for CSRF and other errors
app.use((err, req, res, next) => {
  // Handle CSRF token errors
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      error: "Invalid CSRF token. Please try refreshing the page and submitting the form again.",
    });
  }

  // Log the error stack for debugging purposes
  console.error(err.stack);

  // Send a JSON response with the error message and status code
  res.status(err.status || 500).json({ error: err.message });
});

export { app };
