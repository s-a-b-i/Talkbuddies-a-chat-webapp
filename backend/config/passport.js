// config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';
import { sendWelcomeEmail, sendGoogleLoginEmail } from '../services/emailService.js';

export const configurePassport = () => {
  // Local Strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        if (user.isLocked) {
          return done(null, false, { message: 'Account is locked. Try again later.' });
        }

        const isValid = await user.isPasswordCorrect(password);

        if (!isValid) {
          await user.incrementLoginAttempts();
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, update their information
        user.googleProfile = profile;
        await user.save();
        
        // Send Google login email
        try {
          await sendGoogleLoginEmail(user);
          console.log("Google login email sent successfully");
        } catch (error) {
          console.error("Error sending Google login email:", error);
        }
        
        return done(null, user);
      }

      // User doesn't exist, create a new user
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        image: profile.photos[0].value,
        googleProfile: profile,
        firstLogin: true
      });

      await user.save();

      // Send welcome email for new Google users
      try {
        await sendWelcomeEmail(user);
        console.log("Welcome email sent successfully for new Google user");
      } catch (error) {
        console.error("Error sending welcome email for new Google user:", error);
      }

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

// Custom middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Custom middleware to check if user is not authenticated
export const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(400).json({ message: 'Already authenticated' });
};