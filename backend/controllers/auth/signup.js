// controllers/auth.controller.js

import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';

export const signup = asynchandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName
  });

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const createdUser = await User.findById(user._id).select("-password -refreshTokens");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  return res.status(201).json({
    success: true,
    user: createdUser,
    accessToken
  });
});