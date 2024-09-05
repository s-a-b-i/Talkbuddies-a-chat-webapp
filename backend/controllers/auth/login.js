import User from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asynchandler } from "../../utils/asynchandler.js";
import { generateTokens } from "../../utils/generatetokens.js";
import { validateEmail, validatePassword } from "../../utils/validators.js";

export const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    throw new ApiError(400, "Valid email is required");
  }
  if (!password || !validatePassword(password)) {
    throw new ApiError(400, "Valid password is required");
  }

  const user = await User.findOne({ email }).select("+password");
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

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const { accessToken, refreshToken } = await generateTokens(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(200)
    .json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"));
});