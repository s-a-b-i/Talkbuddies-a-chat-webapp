import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js'; 
import { revokeRefreshToken } from '../../utils/generatetokens.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

export const logout = asynchandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  // Ensure req.user is defined and contains _id
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  // Revoke the refresh token
  await revokeRefreshToken(req.user._id, refreshToken);

  // Define cookie options if needed
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: 'strict', // Helps prevent CSRF attacks
  };

  // Clear cookies
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
