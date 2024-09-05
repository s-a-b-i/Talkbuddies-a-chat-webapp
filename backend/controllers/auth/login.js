import User from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asynchandler } from "../../utils/asynchandler.js";
import { generateTokens } from "../../utils/generatetokens.js";
import { validateEmail, validatePassword } from "../../utils/validators.js";

export const login = asynchandler(async (req, res) => {
  console.log("Login attempt started");
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    console.log("Invalid email provided");
    throw new ApiError(400, "Valid email is required");
  }
  if (!password || !validatePassword(password)) {
    console.log("Invalid password provided");
    throw new ApiError(400, "Valid password is required");
  }

  console.log("Searching for user with email:", email);
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.log("User not found");
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isLocked) {
    console.log("Account is locked:", user._id);
    throw new ApiError(423, "Account is locked. Try again later");
  }

  console.log("Validating password for user:", user._id);
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    console.log("Invalid password attempt for user:", user._id);
    await user.incrementLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  console.log("Password validated successfully for user:", user._id);
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  console.log("User login attempts reset");

  console.log("Generating tokens for user:", user._id);
  const { accessToken, refreshToken } = await generateTokens(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  console.log("Fetching logged in user data");
  const loggedInUser = await User.findById(user._id).select("-password -refreshTokens");

  console.log("Login successful for user:", user._id);
  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(200)
    .json(new ApiResponse(200, { user: loggedInUser }, "User logged in successfully"));
});