import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // Get username and password from request
        const username = req.body.username;
        const password = req.body.password;

        // Make sure both fields were sent
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Look for the user in the database
        const user = await User.findOne({ username: username });

        // If no user found, send error
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Check if the user verified their email
        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Create a token for the user
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        );

        // Send the token and user info
        return res.status(200).json( {
            token: token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username
            }
        });
    } 
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});
export default router;