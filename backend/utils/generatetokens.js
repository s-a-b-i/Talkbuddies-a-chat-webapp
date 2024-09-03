import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

// Secrets and Expiry
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const MAX_REFRESH_TOKENS = 5; // Maximum number of refresh tokens per user

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }, 
    ACCESS_TOKEN_SECRET, 
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate and Save Refresh Token
const generateRefreshToken = async (userId) => {
  const refreshTokenId = crypto.randomBytes(16).toString('hex');
  const refreshToken = jwt.sign({ id: userId, tokenId: refreshTokenId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  
  // Save the refresh token to the user's record and remove old tokens if necessary
  await User.findByIdAndUpdate(userId, { 
    $push: { 
      refreshTokens: { 
        $each: [{ token: refreshToken, tokenId: refreshTokenId, createdAt: new Date() }],
        $sort: { createdAt: -1 },
        $slice: MAX_REFRESH_TOKENS
      } 
    } 
  }, { new: true });
  
  return refreshToken;
};

// Generate Both Tokens
const generateTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);
  
  return { accessToken, refreshToken };
};

// Revoke Refresh Token
const revokeRefreshToken = async (userId, tokenId) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { tokenId: tokenId } }
  });
};

// Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts from this IP, please try again after 15 minutes"
});

// Cleanup old tokens
const cleanupOldTokens = async () => {
  const currentDate = new Date();
  await User.updateMany({}, {
    $pull: {
      refreshTokens: {
        createdAt: { $lt: new Date(currentDate - 7 * 24 * 60 * 60 * 1000) } // Remove tokens older than 7 days
      }
    }
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  revokeRefreshToken,
  loginLimiter,
  cleanupOldTokens
};