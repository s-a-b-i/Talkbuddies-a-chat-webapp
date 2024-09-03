// controllers/auth.controller.js

import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js'
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';

export const signup = asynchandler(async (req, res) => {
  const { email, password, firstName, lastName , profileSetup } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new ApiError(400, "Email, password, first name, and last name are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    profileSetup
  });

  const { accessToken, refreshToken } = await generateTokens(user);

  const createdUser = await User.findById(user._id).select("-password -refreshTokens");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict'
  };

  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(201)
    .json(new ApiResponse(201, { user: createdUser }, "User registered successfully"));
});