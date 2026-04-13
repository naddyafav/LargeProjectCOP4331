import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  // requireTLS: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// Optional: verify SMTP connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP verify failed:", error);
  } else {
    console.log("SMTP server is ready to send emails.");
  }
});

// POST /register
router.post("/", async (req, res) => {
  let newUser = null;

  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    console.log("REGISTER ROUTE HIT");
    console.log("Incoming email:", email);
    console.log("Incoming username:", username);

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

    newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      friends: []
    });

    await newUser.save();
    console.log("User saved to database:", newUser.email);

    const verificationLink = `${req.protocol}://${req.get("host")}/register/verify/${verificationToken}`;

    console.log("About to send verification email...");
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
    console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log("Verification link:", verificationLink);

    const mailResult = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email.toLowerCase(),
      subject: "Verify your Quiz account",
      html: `
        <h2>Welcome to the Quiz App</h2>
        <p>Thank you for registering.</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `
    });

    console.log("Mail sent successfully.");
    console.log("Mail result:", mailResult);

    return res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("===== REGISTRATION ERROR =====");
    console.error("message:", error.message);
    console.error("code:", error.code);
    console.error("responseCode:", error.responseCode);
    console.error("response:", error.response);
    console.error("command:", error.command);
    console.error("FULL ERROR:", error);

    if (newUser && newUser._id) {
      try {
        await User.deleteOne({ _id: newUser._id });
        console.log("Rolled back user because email sending failed.");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    return res.status(500).json({
      error: error.message || "Registration failed because verification email could not be sent."
    });
  }
});

// GET /register/verify/:token
router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    console.log("VERIFY ROUTE HIT");
    console.log("Verification token:", token);

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification link."
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "User already verified."
      });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    console.log("User verified successfully:", user.email);

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