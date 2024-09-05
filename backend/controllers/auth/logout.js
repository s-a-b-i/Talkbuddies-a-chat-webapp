import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { revokeRefreshToken } from '../../utils/generatetokens.js';

export const logout = asynchandler(async (req, res) => {
  console.log("Logout process started");
  const { refreshToken } = req.cookies;

  console.log("Received refresh token:", refreshToken);

  if (!refreshToken) {
    console.log("No refresh token found in cookies");
    throw new ApiError(400, "Refresh token is required");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("Decoded token:", decodedToken);
  } catch (err) {
    console.error("Token verification error:", err);
    throw new ApiError(401, "Invalid refresh token");
  }

  console.log("req.user:", req.user);

  if (!req.user || !req.user._id || decodedToken.id !== req.user._id.toString()) {
    console.log("User authentication mismatch. req.user:", req.user, "decodedToken:", decodedToken);
    throw new ApiError(401, "User not authenticated");
  }

  try {
    await revokeRefreshToken(req.user._id, decodedToken.tokenId);
    console.log("Refresh token revoked successfully");
  } catch (error) {
    console.error("Error revoking refresh token:", error);
    throw new ApiError(500, "Error during logout process");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
  };

  console.log("Preparing to clear cookies and send response");

  try {
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    res.status(200).json({ message: "User logged out successfully" });
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Error sending response:", error);
    throw new ApiError(500, "Error sending logout response");
  }

  console.log("Logout process completed");
});