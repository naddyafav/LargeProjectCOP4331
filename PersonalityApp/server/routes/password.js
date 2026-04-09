import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

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
  

