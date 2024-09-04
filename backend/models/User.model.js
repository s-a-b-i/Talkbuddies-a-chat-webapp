import mongoose from "mongoose";
import bcrypt from "bcrypt";
import passwordComplexity from "joi-password-complexity";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    image: String,
    color: Number,
    profileSetup: String,
    refreshTokens: [
      {
        token: String,
        tokenId: String,
        createdAt: Date,
        deviceFingerprint: String, // For token binding
      },
    ],
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: Number,
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: String, // Storing MFA secret key
  },
  {
    timestamps: true,
  }
);

// Password hashing and rehashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
  };
  
  const { error } = passwordComplexity(complexityOptions).validate(this.password);
  if (error) {
    throw new Error("Password does not meet complexity requirements");
  }

  const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password verification
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Login attempts and account locking
userSchema.methods.incrementLoginAttempts = function (cb) {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne(
      {
        $set: { loginAttempts: 1 },
        $unset: { lockUntil: 1 },
      },
      cb
    );
  }

  let updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates, cb);
};

// Account lock check
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model("User", userSchema);

export default User;
