import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { authRouter } from "./routes/Auth.routes.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { csrfProtection } from "./middlewares/csrfProtection.js";
import { securityHeaders } from "./middlewares/securityHeaders.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(generalLimiter); // Apply general rate limits
app.use(securityHeaders); // Apply security headers

// Use CSRF protection globally
app.use(csrfProtection);

app.use("/auth", authRouter);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});



export {app}
