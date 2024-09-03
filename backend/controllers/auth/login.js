import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { generateTokens } from '../../utils/generatetokens.js';

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

  // Options for setting cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production
    sameSite: 'strict', // Helps prevent CSRF attacks
    maxAge: 15 * 60 * 1000 // Access token cookie expiration time (15 minutes)
  };

  // Respond with cookies and user data
  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // Refresh token cookie expiration time (7 days)
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
