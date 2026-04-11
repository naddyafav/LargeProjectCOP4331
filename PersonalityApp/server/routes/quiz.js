// server/routes/quiz.js

import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Question from '../models/Question.js';
import { cloudProfiles, AXES } from '../utils/cloudProfiles.js';

const router = express.Router();

// ─── Auth Middleware ───────────────────────────────────────────────────────────
// Verifies the JWT sent in the Authorization header.
// Attaches the decoded payload (userId, username) to req.user.
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// ─── Cosine Similarity ────────────────────────────────────────────────────────
// Compares the user's axis score vector against each cloud profile's vector.
// Returns the cloud profile with the highest similarity score.
function matchCloudProfile(scores) {
  let bestMatch = null;
  let bestScore = -Infinity;

  for (const profile of cloudProfiles) {
    // Build vectors from the shared AXES list
    const userVec    = AXES.map(axis => scores[axis]  || 0);
    const profileVec = AXES.map(axis => profile[axis] || 0);

    // Dot product
    const dot = userVec.reduce((sum, val, i) => sum + val * profileVec[i], 0);

    // Magnitudes
    const userMag    = Math.sqrt(userVec.reduce((sum, val) => sum + val * val, 0));
    const profileMag = Math.sqrt(profileVec.reduce((sum, val) => sum + val * val, 0));

    const similarity = userMag && profileMag ? dot / (userMag * profileMag) : 0;

    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = profile;
    }
  }

  return bestMatch;
}

// ─── GET /quiz/questions ───────────────────────────────────────────────────────
// Returns all 12 questions sorted by order.
// Requires a valid JWT.
router.get('/questions', requireAuth, async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ order: 1 });

    if (!questions.length) {
      return res.status(404).json({ error: 'No questions found. Run seed.js first.' });
    }

    return res.status(200).json({ questions });
  } catch (err) {
    console.error('Error fetching questions:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ─── POST /quiz/submit ─────────────────────────────────────────────────────────
// Accepts the user's accumulated axis scores, runs cosine similarity,
// saves the result to the user document, and returns the matched cloud profile.
//
// Expected request body:
// {
//   scores: { dreamer: 12, energy: 8, warmth: 15, daring: 6 }
// }
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { scores } = req.body;

    if (!scores) {
      return res.status(400).json({ error: 'scores are required.' });
    }

    // Run cosine similarity matching
    const matchedProfile = matchCloudProfile(scores);

    // Save the result to the user document
    await User.findByIdAndUpdate(req.user.userId, {
      personalityType: matchedProfile.name,
    });

    return res.status(200).json({ result: matchedProfile });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

export default router;
