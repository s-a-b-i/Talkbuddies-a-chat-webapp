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
  console.log("CSRF token requested");
  res.json({
    csrfToken: req.csrfToken(),
    cookies: req.cookies,
  });
});

authRouter.post("/signup", csrfProtection, (req, res, next) => {
  console.log("Signup attempt:", req.body.email);
  signup(req, res, next);
});

authRouter.post("/login", csrfProtection, loginLimiter, (req, res, next) => {
  console.log("Login attempt:", req.body.email);
  login(req, res, next);
});

authRouter.post("/logout", csrfProtection, verifyJWT, (req, res, next) => {
  console.log("Logout attempt");
  logout(req, res, next);
});

// Google Auth Routes
authRouter.get('/google', (req, res, next) => {
  console.log("Google auth initiated");
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    callbackURL: 'http://localhost:8000/api/v1/auth/google/callback'
  })(req, res, next);
});

authRouter.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/chat');
  }
);




export { authRouter };