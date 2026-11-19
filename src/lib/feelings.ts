import type { Tone } from "./tone";

export type Feeling = { name: string; tone: Tone; words: string[]; heavy?: boolean };

/** Classic check-in feelings (2.2) and their precise words (2.3). */
export const FEELINGS: Feeling[] = [
  { name: "Calm", tone: "mint", words: ["peaceful", "settled", "relaxed", "content"] },
  { name: "Okay", tone: "lime", words: ["fine", "steady", "alright", "neutral"] },
  { name: "Anxious", tone: "sun", words: ["worried", "tense", "on edge", "panicky", "dreading", "restless"] },
  { name: "Sad", tone: "sky", words: ["low", "down", "hurt", "hopeless", "empty", "disappointed"], heavy: true },
  { name: "Angry", tone: "peach", words: ["irritated", "frustrated", "resentful", "furious"] },
  { name: "Numb", tone: "lavender", words: ["flat", "disconnected", "blank", "tired"], heavy: true },
  { name: "Overwhelmed", tone: "peach", words: ["too much", "swamped", "frozen", "drowning"], heavy: true },
  { name: "Lonely", tone: "lavender", words: ["left out", "unseen", "isolated", "homesick"] },
];

export const BODY = ["tight chest", "knotted stomach", "tense shoulders", "clenched jaw", "heavy limbs", "racing heart"];
export const CAUSES = ["Family", "Work", "Studies", "Health", "Money", "A relationship", "Friends", "Sleep", "Nothing specific"];

export const feelingTone = (name: string): Tone => FEELINGS.find((f) => f.name === name)?.tone ?? "lime";
