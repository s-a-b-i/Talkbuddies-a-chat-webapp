import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';



export const logout = asynchandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  await revokeRefreshToken(req.user._id, refreshToken);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
  };

  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


