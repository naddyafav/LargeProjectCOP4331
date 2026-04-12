import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const userId = decoded.userId;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        friends: user.friends,
        personalityType: user.personalityType
        });

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

export default router;