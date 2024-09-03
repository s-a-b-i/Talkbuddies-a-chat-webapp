// controllers/auth.controller.js

import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';



export const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isLocked) {
    throw new ApiError(423, "Account is locked. Try again later");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const { accessToken, refreshToken } = await generateTokens(user);

  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  return res.status(200).json({
    success: true,
    user: loggedInUser,
    accessToken
  });
});

