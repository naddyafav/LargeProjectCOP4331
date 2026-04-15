import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Middleware to verify JWT
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Access denied. No token provided."
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token."
    });
  }
}

// POST /friends/add
router.post("/add", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const friendUsername = req.body.username;

    if (!friendUsername) {
      return res.status(400).json({
        error: "Friend username is required."
      });
    }

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findOne({ username: friendUsername });

    if (!currentUser) {
      return res.status(404).json({
        error: "Current user not found."
      });
    }

    if (!friendUser) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    if (currentUser._id.toString() === friendUser._id.toString()) {
      return res.status(400).json({
        error: "You cannot add yourself as a friend."
      });
    }

    const alreadyFriends = currentUser.friends.some(
      (friendId) => friendId.toString() === friendUser._id.toString()
    );

    if (alreadyFriends) {
      return res.status(400).json({
        error: "This user is already your friend."
      });
    }

    currentUser.friends.push(friendUser._id);
    friendUser.friends.push(currentUser._id);

    await currentUser.save();
    await friendUser.save();

    return res.status(200).json({
      message: "Friend added successfully.",
      friend: {
        id: friendUser._id,
        username: friendUser.username,
        firstName: friendUser.firstName,
        lastName: friendUser.lastName,
        email: friendUser.email
      }
    });
  } catch (error) {
    console.error("Add friend error:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

//GET /friends/list
router.get("/list", verifyToken, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId).populate("friends", "username firstName lastName");

    if(!currentUser) {
      return res.status(404).json({ 
        error: "User not found" });
    }

    const total   = currentUser.friends.length;
    const friends = currentUser.friends.slice(skip, skip + limit);

    return res.status(200).json({friends, total});

  } catch(error) {
    console.error("List friends error:", error);
    return res.status(500).json({ error: "Server error. Please try again later. "});
  }
});

//GET /friends/search
router.get("/search", verifyToken, async(req, res) => {
  try {
    const query = req.query.q?.trim();

    if(!query) {
      return res.status(400).json({ 
        error: "Search query is required." 
      });
    }

    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeQuery = escapeRegex(query);

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId);

    const total = await User.countDocuments({
      _id: { $nin: currentUser.friends.concat([currentUser._id]) },
      $or: [
        { username: { $regex: safeQuery, $options: "i" } },
        { firstName: { $regex: safeQuery, $options: "i" } },
        { lastName: { $regex: safeQuery, $options: "i" } }
      ]
    });

    const results = await User.find({
      _id: { $nin: currentUser.friends.concat([currentUser._id]) },
      $or: [
        { username: { $regex: safeQuery, $options: "i" } },
        { firstName: { $regex: safeQuery, $options: "i" } },
        { lastName: { $regex: safeQuery, $options: "i" } }
      ]
    })
      .select("username firstName lastName")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ results, total });

  } catch(error) {
    console.error("Search friends error:", error);
    return res.status(500).json({ 
      error: "Server error. Please try again later." });
  }
});

// GET /friends/recommended
router.get("/recommended", verifyToken, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    if (!currentUser.personalityType) {
      return res.status(200).json({
        message: "Take the quiz to find users with a similar personality!",
        results: []
      });
    }

    const total = await User.countDocuments({
      _id: { $nin: currentUser.friends.concat([currentUser._id]) },
      personalityType: currentUser.personalityType
    });
    
    const recommended = await User.find({
      _id: { $nin: currentUser.friends.concat([currentUser._id]) },
      personalityType: currentUser.personalityType
    })
      .select("username firstName lastName personalityType")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      results: recommended, total
    });

  } catch (error) {
    console.error("Recommended friends error:", error);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

// DELETE /friends/remove
router.delete("/remove", verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const friendUsername = req.body.username;

    if (!friendUsername) {
      return res.status(400).json({
        error: "Friend username is required."
      });
    }

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findOne({ username: friendUsername });

    if (!currentUser) {
      return res.status(404).json({
        error: "Current user not found."
      });
    }

    if (!friendUser) {
      return res.status(404).json({
        error: "User not found."
      });
    }

    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === friendUser._id.toString()
    );

    if (!isFriend) {
      return res.status(400).json({
        error: "This user is not in your friends list."
      });
    }

    currentUser.friends = currentUser.friends.filter(
      (friendId) => friendId.toString() !== friendUser._id.toString()
    );
    friendUser.friends = friendUser.friends.filter(
      (friendId) => friendId.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await friendUser.save();

    return res.status(200).json({
      message: "Friend removed successfully.",
      friend: {
        id: friendUser._id,
        username: friendUser.username,
        firstName: friendUser.firstName,
        lastName: friendUser.lastName,
        email: friendUser.email
      }
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    return res.status(500).json({
      error: "Server error. Please try again later."
    });
  }
});

export default router;