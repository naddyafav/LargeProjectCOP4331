// server/models/Question.js

import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  points: {
    dreamer: { type: Number, default: 0 },
    energy:  { type: Number, default: 0 },
    warmth:  { type: Number, default: 0 },
    daring:  { type: Number, default: 0 },
  },
});

const questionSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    unique: true,
  },
  text: {
    type: String,
    required: true,
  },
  tags: [String],
  options: [optionSchema],
});

export default mongoose.model('Question', questionSchema);
