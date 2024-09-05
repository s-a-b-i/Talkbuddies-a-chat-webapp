import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';



export const logout = asynchandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  // Verify the refresh token before proceeding with revocation
  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (!req.user || !req.user._id || decodedToken.id !== req.user._id.toString()) {
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


