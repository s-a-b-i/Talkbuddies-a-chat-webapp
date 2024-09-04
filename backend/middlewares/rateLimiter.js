import { rateLimit } from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 login attempts
    message: "Too many login attempts, please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Max 100 requests per minute
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });