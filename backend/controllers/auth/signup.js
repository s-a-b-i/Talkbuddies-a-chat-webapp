import User from '../../models/User.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asynchandler } from '../../utils/asynchandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { generateTokens, revokeRefreshToken } from '../../utils/generatetokens.js';
import { validateEmail, validatePassword } from '../../utils/validators.js';

export const signup = asynchandler(async (req, res) => {
  console.log("Signup process started");
  const { email, password, firstName, lastName, profileSetup } = req.body;

  // Input Validation
  if (!email || !validateEmail(email)) {
    console.log("Invalid email provided:", email);
    throw new ApiError(400, "Valid email is required");
  }
  if (!password || !validatePassword(password)) {
    console.log("Invalid password provided");
    throw new ApiError(400, "Valid password is required");
  }
  if (!firstName || !lastName) {
    console.log("Missing first name or last name");
    throw new ApiError(400, "First name and last name are required");
  }

  console.log("Checking for existing user with email:", email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log("User already exists with email:", email);
    throw new ApiError(409, "User with this email already exists");
  }

  console.log("Creating new user");
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    profileSetup,
  });

  console.log("Generating tokens for new user");
  const { accessToken, refreshToken } = await generateTokens(user);

  console.log("Fetching created user data");
  const createdUser = await User.findById(user._id).select("-password -refreshTokens");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
  };

  console.log("User registration successful, ID:", user._id);
  res
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(201)
    .json(new ApiResponse(201, { user: createdUser }, "User registered successfully"));
});