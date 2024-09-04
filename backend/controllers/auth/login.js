import User from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asynchandler } from "../../utils/asynchandler.js";
import { generateTokens, revokeRefreshToken } from "../../utils/generatetokens.js";
import { validateEmail, validatePassword } from "../../utils/validators.js";
import speakeasy from "speakeasy";

export const login = asynchandler(async (req, res) => {
  const { email, password, otp, deviceFingerprint } = req.body;

  if (!email || !validateEmail(email)) {
    throw new ApiError(400, "Valid email is required");
  }
  if (!password || !validatePassword(password)) {
    throw new ApiError(400, "Valid password is required");
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

  // Check MFA if enabled
  if (user.mfaEnabled) {
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: otp,
    });

    if (!verified) {
      throw new ApiError(401, "Invalid OTP");
    }
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const { accessToken, refreshToken } = await generateTokens(user, deviceFingerprint);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  };

  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      status: 200,
      data: {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      message: "User logged in successfully",
    });
});
