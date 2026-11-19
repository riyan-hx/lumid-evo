/**
 * Client-side first pass at "Evo heard" (C5) until the server parser lands (build step 15).
 * Keyword matching only — the person always confirms or fixes each field.
 */
const FEELINGS: [RegExp, string][] = [
  [/anxious|worried|nervous|panic|scared|tense|ടെൻഷൻ|പേടി/i, "Anxious"],
  [/sad|down|low|cry|hopeless|സങ്കടം/i, "Sad"],
  [/angry|mad|annoyed|furious|irritat|ദേഷ്യം/i, "Angry"],
  [/lonely|alone|left out|ഒറ്റ/i, "Lonely"],
  [/numb|empty|blank|flat/i, "Numb"],
  [/overwhelm|too much|swamp/i, "Overwhelmed"],
  [/calm|relaxed|peaceful/i, "Calm"],
  [/okay|fine|alright|good/i, "Okay"],
];
const TOPICS: [RegExp, string][] = [
  [/work|office|meeting|boss|manager|job/i, "Work"],
  [/exam|study|studies|college|class/i, "Studies"],
  [/family|amma|mum|mom|dad|appa|brother|sister/i, "Family"],
  [/money|rent|bills|loan/i, "Money"],
  [/sleep|insomnia|can't sleep/i, "Sleep"],
  [/friend/i, "Friends"],
  [/health|sick|pain/i, "Health"],
];

export type Heard = { feelings: string[]; intensity: number; energy: "Low" | "Medium" | "High"; about: string[] };

export function parseSpeech(text: string): Heard {
  let feelings = FEELINGS.filter(([r]) => r.test(text)).map(([, f]) => f);
  // "Okay" only when nothing more specific was said.
  if (feelings.length > 1) feelings = feelings.filter((f) => f !== "Okay");
  if (/tired|exhausted|drained/i.test(text)) feelings.push("tired");
  const about = TOPICS.filter(([r]) => r.test(text)).map(([, t]) => t);
  if (/tomorrow/i.test(text)) about.push("tomorrow");
  const strong = /really|very|so |extremely|can't|cannot/i.test(text);
  const soft = /a bit|a little|slightly|i guess|kind of/i.test(text);
  const tired = /tired|exhausted|drained|sleepy/i.test(text);
  return {
    feelings: feelings.length ? feelings.slice(0, 2) : ["Okay"],
    intensity: strong ? 75 : soft ? 50 : 60,
    energy: tired ? "Low" : /energ|excited|wired/i.test(text) ? "High" : "Medium",
    about: about.slice(0, 2),
  };
}
