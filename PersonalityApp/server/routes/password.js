import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import User from "../models/User.js";

const router = express.Router();

sgMail.setApiKey(process.env.EMAIL_PASSWORD);

// POST /password
router.post("/", async (req, res) => {
  try {
    const email = req.body.email;

    console.log("RESET PASSWORD ROUTE HIT");
    console.log("Incoming email:", email);

    if (!email) {
      return res.status(400).json({
        error: "Email required."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(409).json({
        error: "Email not registered."
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;

    await user.save();

    const verificationLink = `http://group9.online/password/reset/${verificationToken}`;

    const msg = {
      to: normalizedEmail,
      from: process.env.EMAIL_FROM,
      subject: "Reset your Cloud Connect password",
      html: `
        <h2>Oh no! You forgot your password.</h2>
        <p>No problem.</p>
        <p>Please click the link below to reset your password:</p>
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
      message: "Email sent successfully. Please check your email to reset your password."
    });
  } catch (error) {
    console.error("===== RESET PASSWORD ERROR =====");
    console.error("message:", error.message);
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: error.message || "Email send failed."
    });
  }
});

// POST /password/reset
router.post("/reset", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required."
      });
    }

    const user = await User.findOne({ verificationToken: token });

    if(!user){
        return res.status(400).json({
          error: "Invalid or expired reset token."
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.verificationToken = null;
    await user.save();

    return res.status(200).json({
        message: "Password reset successful. You can now log in."
    });

  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

export default router;
  

