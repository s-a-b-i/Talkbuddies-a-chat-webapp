// routes/Auth.routes.js

import { Router } from "express";
import passport from 'passport';
import { login } from "../controllers/auth/login.js";
import { signup } from "../controllers/auth/signup.js";
import { logout } from "../controllers/auth/logout.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { loginLimiter, generalLimiter } from "../middlewares/rateLimiter.js";
import { csrfProtection } from "../middlewares/csrfProtection.js";
import { securityHeaders } from "../middlewares/securityHeaders.js";

const authRouter = Router();

authRouter.use(securityHeaders);

authRouter.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
    cookies: req.cookies,
  });
});

authRouter.post("/signup", csrfProtection, signup);
authRouter.post("/login", csrfProtection, loginLimiter, login);
authRouter.post("/logout", csrfProtection, verifyJWT, logout);

// Google Auth Routes
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Send a JSON response with user data or tokens
    const user = req.user;
    res.status(200).json({
      message: "Google login successful",
      user: user,
    });
  }
);


export { authRouter };