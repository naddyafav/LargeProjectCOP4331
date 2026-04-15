// server/utils/cloudProfiles.js
//
// All 10 cloud personality profiles.
// These are the target direction vectors used in cosine similarity matching.
// Only the ratio between axes matters, not the magnitude.
//
// Axes:
//   dreamer — imaginative, abstract, introspective vs practical, grounded
//   energy  — intense, electric, active vs calm, still, quiet
//   warmth  — nurturing, social, people-oriented vs cool, independent
//   daring  — bold, risk-taking, adventurous vs cautious, steady, safe

export const AXES = ['dreamer', 'energy', 'warmth', 'daring'];

export const cloudProfiles = [
  {
    name:        'Cirrus',
    emoji:       '🌤',
    altitude:    'High altitude',
    description: "Wispy and free-spirited, you drift above it all. You're a deep thinker who sees patterns others miss — a quiet visionary with your head in the clouds (literally).",
    traits:      ['imaginative', 'introspective', 'independent'],
    dreamer: 32, energy: 6,  warmth: 10, daring: 18,
  },
  {
    name:        'Cirrostratus',
    emoji:       '🌥',
    altitude:    'High altitude',
    description: "You cover a lot of ground quietly. Subtle and understated, you create atmosphere without demanding attention — people feel your presence even when they can't quite explain why.",
    traits:      ['subtle', 'perceptive', 'calming'],
    dreamer: 28, energy: 5,  warmth: 20, daring: 8,
  },
  {
    name:        'Cirrocumulus',
    emoji:       '🌦',
    altitude:    'High altitude',
    description: "Playful and full of pattern, you bring texture to any situation. You're the creative type who turns the ordinary into something worth looking at twice.",
    traits:      ['creative', 'detail-oriented', 'whimsical'],
    dreamer: 30, energy: 14, warmth: 18, daring: 16,
  },
  {
    name:        'Altostratus',
    emoji:       '☁️',
    altitude:    'Mid altitude',
    description: "Steady and expansive, you have a quiet intensity that fills the room. You're dependable to the core — not flashy, but the kind of person who always comes through.",
    traits:      ['dependable', 'thoughtful', 'composed'],
    dreamer: 18, energy: 10, warmth: 22, daring: 8,
  },
  {
    name:        'Altocumulus',
    emoji:       '🌤',
    altitude:    'Mid altitude',
    description: "Balanced and creative, you move between worlds effortlessly. Thoughtful but not afraid to surprise — you contain multitudes and wear them comfortably.",
    traits:      ['curious', 'adaptable', 'creative'],
    dreamer: 26, energy: 16, warmth: 20, daring: 20,
  },
  {
    name:        'Stratus',
    emoji:       '🌫',
    altitude:    'Low altitude',
    description: "Quiet and constant, you're the steady presence everyone depends on. Not flashy, but utterly irreplaceable — you show up every single day without needing applause.",
    traits:      ['calm', 'caring', 'reliable'],
    dreamer: 16, energy: 5,  warmth: 26, daring: 5,
  },
  {
    name:        'Stratocumulus',
    emoji:       '🌥',
    altitude:    'Low altitude',
    description: "Warm, familiar, and comforting — you're the most relatable person in the room. You have a gift for making people feel at ease, and your grounded energy is magnetic.",
    traits:      ['warm', 'grounded', 'sociable'],
    dreamer: 14, energy: 18, warmth: 32, daring: 12,
  },
  {
    name:        'Nimbostratus',
    emoji:       '🌧',
    altitude:    'Low-mid altitude',
    description: "Deep and persistent, when you commit to something you see it all the way through. You feel things intensely and aren't afraid of the emotional heavy lifting others avoid.",
    traits:      ['persistent', 'empathetic', 'intense'],
    dreamer: 20, energy: 14, warmth: 24, daring: 14,
  },
  {
    name:        'Cumulus',
    emoji:       '⛅',
    altitude:    'Low-mid altitude',
    description: "Bright and warm, people gravitate toward you naturally. You're the kind of person who makes everywhere feel like home — cheerful, solid, and genuinely good company.",
    traits:      ['friendly', 'energetic', 'optimistic'],
    dreamer: 16, energy: 24, warmth: 30, daring: 14,
  },
  {
    name:        'Cumulonimbus',
    emoji:       '⛈',
    altitude:    'All altitudes',
    description: "Powerful and electric, you make things happen — dramatically. When you walk into a room, people notice. You're a force of nature and you know it.",
    traits:      ['intense', 'bold', 'passionate'],
    dreamer: 12, energy: 36, warmth: 10, daring: 34,
  },
];
