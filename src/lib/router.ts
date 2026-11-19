import type { CheckIn } from "./checkins";

export type Suggestion = { id: string; title: string; note: string; href: string; recommended?: boolean };
export type Decision = { rule: string; safety: boolean; suggestions: Suggestion[] };

const RISK_WORDS = ["hopeless", "drowning"];

/**
 * Evo router — client version of Dev Docs board 07 (top rule wins).
 * Server takes over in build step 15; thresholds need clinician sign-off.
 */
export function decide(c: Pick<CheckIn, "feeling" | "word" | "intensity" | "note">, recent: CheckIn[] = [], now = new Date()): Decision {
  const heavy = ["Sad", "Numb", "Overwhelmed"].includes(c.feeling);
  const riskWord = c.word && RISK_WORDS.includes(c.word);
  const veryLowRecent = recent.filter((r) => ["Sad", "Numb", "Overwhelmed"].includes(r.feeling) && r.intensity >= 80).length;

  // Rule 1 · safety
  if ((riskWord && c.intensity >= 70) || (heavy && c.intensity >= 90) || (heavy && c.intensity >= 80 && veryLowRecent >= 2)) {
    return { rule: "1-safety", safety: true, suggestions: [] };
  }
  const talk: Suggestion = { id: "talk", title: "Just talk it through", note: "With Evo", href: "/chat?context=checkin" };
  const breathe: Suggestion = { id: "breathe", title: "Breathe it down", note: "1 min", href: "/calm" };
  const thought: Suggestion = { id: "thought", title: "Untangle the thought", note: "CBT thought record · 5 min", href: "/tools" };
  const soothe: Suggestion = { id: "soothe", title: "Something gentle", note: "Soothe kit · 2 min", href: "/discover" };

  // Rule 2 · high arousal → body first
  if ((c.feeling === "Anxious" || c.feeling === "Angry" || c.feeling === "Overwhelmed") && c.intensity >= 70) {
    return { rule: "2-arousal", safety: false, suggestions: [{ ...breathe, note: "1 min · recommended first", recommended: true }, thought, talk] };
  }
  // Rule 3 · late night
  const h = now.getHours();
  if (h >= 23 || h < 5) return { rule: "3-late", safety: false, suggestions: [{ ...breathe, title: "Wind down", href: "/calm", recommended: true }, talk] };
  // Rule 6 · low energy + low mood
  if (heavy || c.feeling === "Lonely") return { rule: "6-low", safety: false, suggestions: [{ ...talk, recommended: true }, soothe, breathe] };
  if (c.feeling === "Anxious") return { rule: "4-thought", safety: false, suggestions: [{ ...thought, recommended: true }, breathe, talk] };
  return { rule: "9-default", safety: false, suggestions: [talk, thought] };
}
