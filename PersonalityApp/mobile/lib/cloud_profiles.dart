class CloudProfile {
  final String name;
  final String emoji;
  final String altitude;
  final String description;
  final List<String> traits;

  const CloudProfile({
    required this.name,
    required this.emoji,
    required this.altitude,
    required this.description,
    required this.traits,
  });
}

const List<CloudProfile> cloudProfiles = [
  CloudProfile(
    name: 'Cirrus',
    emoji: '🌤',
    altitude: 'High altitude',
    description:
        "Wispy and free-spirited, you drift above it all. You're a deep thinker who sees patterns others miss — a quiet visionary with your head in the clouds (literally).",
    traits: ['imaginative', 'introspective', 'independent'],
  ),
  CloudProfile(
    name: 'Cirrostratus',
    emoji: '🌥',
    altitude: 'High altitude',
    description:
        "You cover a lot of ground quietly. Subtle and understated, you create atmosphere without demanding attention — people feel your presence even when they can't quite explain why.",
    traits: ['subtle', 'perceptive', 'calming'],
  ),
  CloudProfile(
    name: 'Cirrocumulus',
    emoji: '🌦',
    altitude: 'High altitude',
    description:
        "Playful and full of pattern, you bring texture to any situation. You're the creative type who turns the ordinary into something worth looking at twice.",
    traits: ['creative', 'detail-oriented', 'whimsical'],
  ),
  CloudProfile(
    name: 'Altostratus',
    emoji: '☁️',
    altitude: 'Mid altitude',
    description:
        "Steady and expansive, you have a quiet intensity that fills the room. You're dependable to the core — not flashy, but the kind of person who always comes through.",
    traits: ['dependable', 'thoughtful', 'composed'],
  ),
  CloudProfile(
    name: 'Altocumulus',
    emoji: '🌤',
    altitude: 'Mid altitude',
    description:
        "Balanced and creative, you move between worlds effortlessly. Thoughtful but not afraid to surprise — you contain multitudes and wear them comfortably.",
    traits: ['curious', 'adaptable', 'creative'],
  ),
  CloudProfile(
    name: 'Stratus',
    emoji: '🌫',
    altitude: 'Low altitude',
    description:
        "Quiet and constant, you're the steady presence everyone depends on. Not flashy, but utterly irreplaceable — you show up every single day without needing applause.",
    traits: ['calm', 'caring', 'reliable'],
  ),
  CloudProfile(
    name: 'Stratocumulus',
    emoji: '🌥',
    altitude: 'Low altitude',
    description:
        "Warm, familiar, and comforting — you're the most relatable person in the room. You have a gift for making people feel at ease, and your grounded energy is magnetic.",
    traits: ['warm', 'grounded', 'sociable'],
  ),
  CloudProfile(
    name: 'Nimbostratus',
    emoji: '🌧',
    altitude: 'Low-mid altitude',
    description:
        "Deep and persistent, when you commit to something you see it all the way through. You feel things intensely and aren't afraid of the emotional heavy lifting others avoid.",
    traits: ['persistent', 'empathetic', 'intense'],
  ),
  CloudProfile(
    name: 'Cumulus',
    emoji: '⛅',
    altitude: 'Low-mid altitude',
    description:
        "Bright and warm, people gravitate toward you naturally. You're the kind of person who makes everywhere feel like home — cheerful, solid, and genuinely good company.",
    traits: ['friendly', 'energetic', 'optimistic'],
  ),
  CloudProfile(
    name: 'Cumulonimbus',
    emoji: '⛈',
    altitude: 'All altitudes',
    description:
        "Powerful and electric, you make things happen — dramatically. When you walk into a room, people notice. You're a force of nature and you know it.",
    traits: ['intense', 'bold', 'passionate'],
  ),
];

CloudProfile? getProfileByName(String name) {
  try {
    return cloudProfiles.firstWhere((p) => p.name == name);
  } catch (_) {
    return null;
  }
}
