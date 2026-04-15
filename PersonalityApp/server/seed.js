// server/seed.js
//
// Run this ONCE to populate your MongoDB with the 12 quiz questions.
// From your server/ folder run:  node seed.js
//
// It will:
//   1. Connect to your MongoDB using the same connection as the rest of the app
//   2. Delete any existing questions (so you can re-run safely)
//   3. Insert all 12 questions with their answer point values
//   4. Disconnect and exit
//
// You do NOT need to run this again unless you want to reset/change the questions.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/Question.js';

dotenv.config({ path: './config/config.env' });

// The 12 quiz questions.
// Each option's points must add up to exactly 3 across all axes combined.
// Only axes the answer affects need to be listed — missing axes default to 0.
//
// Axes:
//   dreamer — imaginative / introspective
//   energy  — active / intense
//   warmth  — nurturing / social
//   daring  — bold / risk-taking

const questions = [
  {
    order: 1,
    text: "It's a free Saturday morning. What are you doing?",
    tags: ['lifestyle', 'free time'],
    options: [
      { label: "Reading or journaling somewhere quiet",          points: { dreamer: 2, warmth: 1 } },
      { label: "Out on a run or doing something active",         points: { energy: 2, daring: 1 } },
      { label: "Catching up with friends over coffee",           points: { warmth: 3 } },
      { label: "Trying something I've never done before",        points: { daring: 2, energy: 1 } },
    ],
  },
  {
    order: 2,
    text: "Your friend group is planning a trip. What's your role?",
    tags: ['social', 'travel'],
    options: [
      { label: "The one who researched every detail in advance",  points: { dreamer: 2, warmth: 1 } },
      { label: "The one who keeps everyone's energy up",          points: { energy: 2, warmth: 1 } },
      { label: "The one making sure everyone feels included",     points: { warmth: 3 } },
      { label: "The one who suggested somewhere unexpected",      points: { daring: 2, dreamer: 1 } },
    ],
  },
  {
    order: 3,
    text: "You get some unexpected news — good or bad. What's your first reaction?",
    tags: ['emotion', 'reaction'],
    options: [
      { label: "Go quiet and process it alone",                   points: { dreamer: 2, energy: 1 } },
      { label: "React big and feel it fully in the moment",       points: { energy: 3 } },
      { label: "Call someone close to talk it through",           points: { warmth: 3 } },
      { label: "Start figuring out what to do about it",          points: { daring: 2, energy: 1 } },
    ],
  },
  {
    order: 4,
    text: "What kind of environment makes you feel most alive?",
    tags: ['nature', 'environment'],
    options: [
      { label: "Wide open sky with nothing but space to think",   points: { dreamer: 3 } },
      { label: "A cliff edge or mountain peak before a storm",    points: { daring: 2, energy: 1 } },
      { label: "A cozy room full of people I love",               points: { warmth: 3 } },
      { label: "A busy city buzzing with possibility",            points: { energy: 2, daring: 1 } },
    ],
  },
  {
    order: 5,
    text: "How do you handle a disagreement with someone you care about?",
    tags: ['conflict', 'relationships'],
    options: [
      { label: "Take time to think before responding",            points: { dreamer: 2, warmth: 1 } },
      { label: "Say exactly what I think, right then and there",  points: { energy: 2, daring: 1 } },
      { label: "Focus on keeping the peace and preserving us",    points: { warmth: 3 } },
      { label: "Push through it — conflict doesn't scare me",     points: { daring: 2, energy: 1 } },
    ],
  },
  {
    order: 6,
    text: "You have to give a presentation at school or work. You feel...",
    tags: ['performance', 'work'],
    options: [
      { label: "Nervous but prepared — I've rehearsed a lot",     points: { dreamer: 2, warmth: 1 } },
      { label: "Excited — I feed off the energy in the room",     points: { energy: 3 } },
      { label: "Fine as long as I know my audience cares",        points: { warmth: 2, dreamer: 1 } },
      { label: "Ready — I actually enjoy the spotlight",          points: { daring: 2, energy: 1 } },
    ],
  },
  {
    order: 7,
    text: "Which of these sounds most like a perfect evening?",
    tags: ['lifestyle', 'evening'],
    options: [
      { label: "A long walk alone with music or a podcast",       points: { dreamer: 2, energy: 1 } },
      { label: "A late night out that goes longer than planned",  points: { energy: 2, daring: 1 } },
      { label: "A dinner party with people I love",               points: { warmth: 3 } },
      { label: "Doing something spontaneous with no real plan",   points: { daring: 3 } },
    ],
  },
  {
    order: 8,
    text: "When you're working on something creative, you tend to...",
    tags: ['creativity', 'work'],
    options: [
      { label: "Get lost in it for hours without noticing time",  points: { dreamer: 3 } },
      { label: "Work in bursts of intense focus and energy",      points: { energy: 2, daring: 1 } },
      { label: "Want to collaborate and share ideas with others", points: { warmth: 2, energy: 1 } },
      { label: "Take risks and try things that might not work",   points: { daring: 2, dreamer: 1 } },
    ],
  },
  {
    order: 9,
    text: "A stranger at a party starts talking to you. You...",
    tags: ['social', 'strangers'],
    options: [
      { label: "Listen more than talk — I love hearing stories",  points: { dreamer: 2, warmth: 1 } },
      { label: "Match their energy and dive right in",            points: { energy: 2, warmth: 1 } },
      { label: "Make sure they feel welcome and comfortable",     points: { warmth: 3 } },
      { label: "Bring up something unexpected to see where it goes", points: { daring: 2, dreamer: 1 } },
    ],
  },
  {
    order: 10,
    text: "What do people most often come to you for?",
    tags: ['relationships', 'strengths'],
    options: [
      { label: "A thoughtful perspective or a fresh idea",        points: { dreamer: 3 } },
      { label: "Motivation when they've lost momentum",           points: { energy: 2, warmth: 1 } },
      { label: "Someone to listen without judgment",              points: { warmth: 3 } },
      { label: "Someone to back them up when they take a risk",   points: { daring: 2, energy: 1 } },
    ],
  },
  {
    order: 11,
    text: "You're making a big life decision. How do you approach it?",
    tags: ['decision making', 'life'],
    options: [
      { label: "Reflect on it deeply until the answer becomes clear", points: { dreamer: 3 } },
      { label: "Trust my gut and move fast",                      points: { energy: 2, daring: 1 } },
      { label: "Talk it through with the people who know me best", points: { warmth: 3 } },
      { label: "Make the bold call even if it scares me",         points: { daring: 3 } },
    ],
  },
  {
    order: 12,
    text: "At the end of a long day, you feel most restored by...",
    tags: ['rest', 'recharge'],
    options: [
      { label: "Quiet time alone — reading, thinking, or creating", points: { dreamer: 3 } },
      { label: "Doing something physical to burn off the day",    points: { energy: 3 } },
      { label: "Quality time with people I care about",           points: { warmth: 3 } },
      { label: "Doing something a little impulsive and fun",      points: { daring: 2, energy: 1 } },
    ],
  },
];

async function seed() {
  try {
    // Connect using ATLAS_URI from config.env
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('Connected to MongoDB.');

    // Clear existing questions so re-running is safe
    await Question.deleteMany({});
    console.log('Cleared existing questions.');

    // Insert all 12 questions
    await Question.insertMany(questions);
    console.log(`Inserted ${questions.length} questions successfully.`);

    // Quick sanity check — print the first question back out
    const first = await Question.findOne({ order: 1 });
    console.log('\nSample question inserted:');
    console.log(`  "${first.text}"`);
    console.log(`  Options: ${first.options.map(o => o.label).join(' | ')}`);

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDone. Disconnected from MongoDB.');
  }
}

seed();
