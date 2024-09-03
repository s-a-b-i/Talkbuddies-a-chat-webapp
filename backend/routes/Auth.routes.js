// routes/auth.routes.js

import {Router} from 'express';
import {  login } from '../controllers/auth/login.js';
import {  signup } from '../controllers/auth/signup.js';
import {  logout } from '../controllers/auth/logout.js';


import { verifyJWT } from '../middlewares/Auth.middleware.js';
import { loginLimiter } from '../utils/generatetokens.js';

const authRouter = Router();



authRouter.post('/signup', signup);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', verifyJWT, logout);

export {authRouter}