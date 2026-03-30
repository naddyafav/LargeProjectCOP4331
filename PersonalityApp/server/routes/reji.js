import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// POST /register
router.post("/", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({
        error: "All fields are required."
      });
    }

    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(409).json({
        error: "Username already taken."
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        error: "Email already in use."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      username: username,
      password: hashedPassword,
      isVerified: false,
      verificationToken: verificationToken
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
      verificationToken: verificationToken
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

// GET /register/verify/:token
router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification link."
      });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully. You can now log in."
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

export default router;