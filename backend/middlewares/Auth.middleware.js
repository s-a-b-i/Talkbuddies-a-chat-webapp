import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const verifyJWT = asynchandler(async (req, _, next) => {
  try {
    // Extract token from cookie or Authorization header
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    try {
      // Verify the token
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Find the user and exclude sensitive information
      const user = await User.findById(decodedToken.id).select(
        "-password -refreshTokens"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Access Token has expired");
      }
      throw new ApiError(401, "Invalid Access Token");
    }
  } catch (error) {
    next(error);
  }
});

// HTTPS middleware
export const requireHTTPS = (req, res, next) => {
  // The 'x-forwarded-proto' check is for Heroku
  if (
    !req.secure &&
    req.get("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV !== "development"
  ) {
    return res.redirect("https://" + req.get("host") + req.url);
  }
  next();
};
