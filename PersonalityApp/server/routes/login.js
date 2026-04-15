import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// POST /login
router.post("/", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required."
      });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password."
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid username or password."
      });
    }

    console.log("Signing with secret:", process.env.ACCESS_TOKEN_SECRET);
    console.log("Token will be:", jwt.sign({ test: 1 }, process.env.ACCESS_TOKEN_SECRET));
    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      token: token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

export default router;
