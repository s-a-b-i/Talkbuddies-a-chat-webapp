import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
const MAX_REFRESH_TOKENS = 5;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = async (userId, deviceFingerprint) => {
  const refreshTokenId = crypto.randomBytes(16).toString("hex");
  const refreshToken = jwt.sign(
    { id: userId, tokenId: refreshTokenId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        refreshTokens: {
          $each: [{ token: refreshToken, tokenId: refreshTokenId, createdAt: new Date(), deviceFingerprint }],
          $sort: { createdAt: -1 },
          $slice: MAX_REFRESH_TOKENS,
        },
      },
    },
    { new: true }
  );

  return refreshToken;
};

const generateTokens = async (user, deviceFingerprint) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id, deviceFingerprint);

  return { accessToken, refreshToken };
};

const revokeRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: refreshToken } },
  });
};

const cleanupOldTokens = async () => {
  const currentDate = new Date();
  await User.updateMany(
    {},
    {
      $pull: {
        refreshTokens: {
          createdAt: { $lt: new Date(currentDate - 7 * 24 * 60 * 60 * 1000) },
        },
      },
    }
  );
};

export { generateAccessToken, generateRefreshToken, generateTokens, revokeRefreshToken, cleanupOldTokens };
