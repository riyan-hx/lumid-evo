/** Classic check-in feelings (2.2) with their Figma tile and icon, and precise words (2.3). */
export type Feeling = { name: string; icon: string; bg: string; words: string[] };

export const FEELINGS: Feeling[] = [
  { name: "Calm", icon: "leaf-mint", bg: "bg-mint-soft", words: ["peaceful", "settled", "relaxed", "content"] },
  { name: "Okay", icon: "sun-sun", bg: "bg-sun-soft", words: ["fine", "steady", "alright", "neutral"] },
  { name: "Anxious", icon: "cloud-sky-18", bg: "bg-sky-soft", words: ["worried", "tense", "on edge", "panicky", "dreading", "restless"] },
  { name: "Sad", icon: "rain-lav", bg: "bg-lavender-soft", words: ["low", "down", "hurt", "hopeless", "empty", "disappointed"] },
  { name: "Angry", icon: "zap-peach-18", bg: "bg-peach-soft", words: ["irritated", "frustrated", "resentful", "furious"] },
  { name: "Numb", icon: "pause-t1", bg: "bg-muted", words: ["flat", "disconnected", "blank", "tired"] },
  { name: "Overwhelmed", icon: "brain-sun-18", bg: "bg-sun-soft", words: ["too much", "swamped", "frozen", "drowning"] },
  { name: "Lonely", icon: "users-peach-18", bg: "bg-peach-soft", words: ["left out", "unseen", "isolated", "homesick"] },
];

/** Body map spots (2.4): centre in the 345-wide Figma body map, inactive dot artwork, and the chip they set. */
export const BODY_SPOTS = [
  { id: "head", label: "Head", chip: "clenched jaw", x: 173, y: 50, dot: "dot-18", size: 18 },
  { id: "shoulder-l", label: "Shoulders", chip: "tense shoulders", x: 140, y: 104, dot: "dot-16", size: 16 },
  { id: "shoulder-r", label: "Shoulders", chip: "tense shoulders", x: 206, y: 104, dot: "dot-16", size: 16 },
  { id: "chest", label: "Chest", chip: "tight chest", x: 173, y: 120, dot: "dot-22", size: 22 },
  { id: "stomach", label: "Stomach", chip: "knotted stomach", x: 173, y: 172, dot: "dot-22", size: 22 },
] as const;

export const BODY = ["tight chest", "knotted stomach", "tense shoulders", "clenched jaw"];
export const CAUSES = ["Family", "Work", "Studies", "Health", "Money", "A relationship", "Friends", "Sleep", "Nothing specific"];
export const ENERGY = ["Very low", "Low", "Medium", "High", "Very high"];
/** Fill fraction per energy step (Figma: "Low" fills 100 of 311). */
export const ENERGY_FILL = [0.08, 0.32, 0.52, 0.76, 0.96];
