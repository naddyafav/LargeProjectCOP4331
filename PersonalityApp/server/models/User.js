// server/models/User.js
 
import mongoose from "mongoose";
 
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  // Stores the matched cloud profile name after completing the quiz
  // e.g. "Cirrus", "Cumulus", "Cumulonimbus", etc.
  // null means the user has not taken the quiz yet.
  personalityType: {
    type: String,
    default: null
  }
});
 
export default mongoose.model("User", userSchema);