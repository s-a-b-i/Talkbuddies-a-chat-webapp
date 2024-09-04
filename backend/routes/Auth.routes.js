import { Router } from "express";
import { login } from "../controllers/auth/login.js";
import { signup } from "../controllers/auth/signup.js";
import { logout } from "../controllers/auth/logout.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { loginLimiter, generalLimiter } from "../middlewares/rateLimiter.js";
import { csrfProtection } from "../middlewares/csrfProtection.js";
import { securityHeaders } from "../middlewares/securityHeaders.js";

const authRouter = Router();

authRouter.use(securityHeaders); // Apply security headers globally

authRouter.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
    cookies: req.cookies,
  });
});

authRouter.post("/signup", csrfProtection, signup);
authRouter.post("/login", csrfProtection, loginLimiter, login);
authRouter.post("/logout", csrfProtection, verifyJWT, logout);

export { authRouter };
