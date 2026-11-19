/** Thought records (4.2–4.8). Device-only until the API lands (build step 15). */
export type Emotion = { name: string; before: number; after?: number };
export type ThoughtRecord = {
  id: string;
  at: string;
  fromChat?: string;
  situation: string;
  when: string;
  who: string;
  emotions: Emotion[];
  hot: string;
  belief: number;
  beliefAfter?: number;
  traps: string[];
  supports: string[];
  against: string[];
  balanced: string;
  journal?: boolean;
};

export type Draft = Omit<ThoughtRecord, "id" | "at">;

const KEY = "evo.thoughts.v1";
const DRAFT = "evo.tr.draft";

export function loadRecords(): ThoughtRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveRecord(d: Draft): ThoughtRecord {
  const r: ThoughtRecord = { ...d, id: crypto.randomUUID(), at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify([r, ...loadRecords()]));
    sessionStorage.removeItem(DRAFT);
  } catch {}
  return r;
}

export function updateRecord(id: string, patch: Partial<ThoughtRecord>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadRecords().map((r) => (r.id === id ? { ...r, ...patch } : r))));
  } catch {}
}

export function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft) {
  try {
    sessionStorage.setItem(DRAFT, JSON.stringify(d));
  } catch {}
}

export const TRAPS = [
  { name: "All-or-nothing", note: '"Never", "always", "everything"', re: /\b(never|always|everything|nothing|everyone|nobody|no one)\b/i },
  { name: "Mind reading", note: "Guessing what others think of you", re: /\b(thinks?|doesn'?t care|don'?t care|hates?|judg)/i },
  { name: "Labelling", note: '"I\'m a failure" instead of "I made a mistake"', re: /\bi'?m (a |an |so |just )?(failure|useless|stupid|worthless|idiot|loser|not enough|not good enough|never good enough)/i },
  { name: "Comparing", note: "Measuring yourself against someone else", re: /\b(compar|than (my|her|him|them)|cousin|everyone else)/i },
  { name: "Catastrophising", note: "Jumping to the worst outcome", re: /\b(ruin|disaster|worst|never recover|end of the world)/i },
] as const;

export function spotTraps(thought: string, situation = "") {
  return TRAPS.filter((t) => t.re.test(thought) || (t.name === "Comparing" && t.re.test(situation))).map((t) => t.name);
}

/** The gentle hint under the trap list (4.5). */
export function trapHint(thought: string) {
  const word = thought.match(TRAPS[0].re)?.[0];
  if (word) return `"${word[0].toUpperCase() + word.slice(1).toLowerCase()}" is often a clue for all-or-nothing thinking.`;
  if (TRAPS[1].re.test(thought)) return "Guessing someone's thoughts is mind reading — what do you actually know?";
  return "Most hot thoughts hide at least one trap. Pick any that feel close.";
}

/** Names / people mentioned in the situation, for the "Who was there" chips (4.2). */
export function peopleIn(text: string) {
  const known = text.match(/\b(Amma|Achan|Appa|Mum|Mom|Dad|mother|father|sister|brother|cousin|manager|boss|teacher|friend|partner)\b/gi) ?? [];
  const named = [...text.matchAll(/\bwith ([A-Z][a-z]+)/g)].map((m) => m[1]);
  const uniq = [...new Set([...named, ...known].map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()))];
  return [...uniq.slice(0, 1), "Family", "Alone", ...(uniq.length ? [] : ["Friends"])].slice(0, 3);
}

/** Balanced-thought suggestions built from the user's own words (4.7). */
export function balancedOptions(hot: string, against: string[], who: string) {
  const core = hot.replace(/^"|"$/g, "").replace(/[.!]+$/, "");
  const fact = against[0] ? against[0][0].toLowerCase() + against[0].slice(1) : "";
  const person = who && !["Family", "Alone", "Friends"].includes(who) ? who : "";
  return [
    person && /compar|enough|good/i.test(core)
      ? `"${person} compares because ${person === "Manager" ? "they" : "she"} worries. It doesn't mean I'm not enough."`
      : `"${core} — that's how it felt. ${fact ? `But ${fact}.` : "It isn't the whole picture."}"`,
    /\b(her|him|them)\b/i.test(core) ? `"Some things I do disappoint ${core.match(/\b(her|him|them)\b/i)![0].toLowerCase()}; many things don't."` : `"Some of this is true; much of it isn't. I had a hard moment — that's all."`,
  ];
}
