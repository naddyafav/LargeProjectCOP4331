import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import User from "../models/User.js";

const router = express.Router();

sgMail.setApiKey(process.env.EMAIL_PASSWORD);

// POST /register
router.post("/", async (req, res) => {
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

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();

    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(409).json({
        error: "Username already taken."
      });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        error: "Email already in use."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      username: trimmedUsername,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      friends: []
    });

    await newUser.save();
    console.log("User saved to database:", newUser.email);

    const verificationLink = `http://group9.online/register/verify/${verificationToken}`;

    const msg = {
      to: normalizedEmail,
      from: process.env.EMAIL_FROM,
      subject: "Verify your Quiz account",
      html: `
        <h2>Welcome to the Quiz App</h2>
        <p>Thank you for registering.</p>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent successfully via SendGrid API.");
      })
      .catch((mailError) => {
        console.error("SendGrid email failed, but user is already registered.");
        console.error(mailError?.response?.body || mailError.message || mailError);
      });

    return res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("===== REGISTRATION ERROR =====");
    console.error("message:", error.message);
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: error.message || "Registration failed."
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
