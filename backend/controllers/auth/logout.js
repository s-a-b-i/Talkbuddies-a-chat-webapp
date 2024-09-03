// controllers/auth.controller.js

import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js'; // Ensure this is correctly imported
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';

export const logout = asynchandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  await revokeRefreshToken(req.user._id, refreshToken);

  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });

});
