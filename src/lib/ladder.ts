/** Small steps when stuck (7.1–7.6). One active ladder, kept on the device. */
export type Rung = { text: string; dread: number };
export type Done = { text: string; expected: number; actual: number; at: string };
export type Ladder = { goal: string; rungs: Rung[]; current: number; moment?: string; song?: boolean; expected?: number; history: Done[]; plannedAt?: string };

const KEY = "evo.ladder.v1";

export function loadLadder(): Ladder | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function saveLadder(l: Ladder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(l));
  } catch {}
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const NAME = /\b(?:tell|reply to|message|text|call|talk to|answer)\s+([A-Z][a-z]+|amma|mum|mom|dad|achan|appa)\b/i;

/** Builds five rungs from the hardest (the goal) down to something almost effortless. */
export function buildRungs(goal: string): Rung[] {
  const g = goal.trim().replace(/[.!]+$/, "");
  const who = g.match(NAME)?.[1];
  if (who) {
    const name = cap(who);
    return [
      { text: /\bwhy\b|story|explain/i.test(g) ? `Tell ${name} the whole story` : cap(g), dread: 9 },
      { text: `Say "it's been a hard month"`, dread: 7 },
      { text: /disappear|quiet|ghost|ignor/i.test(g) ? `Send "sorry I went quiet"` : "Send one short, honest line", dread: 5 },
      { text: `Open ${name}'s chat and type "hey"`, dread: 3 },
      { text: `Look at ${name}'s last message`, dread: 1 },
    ];
  }
  if (/(study|exam|assignment|essay|report|work|project|email|form|apply|application|clean|tidy)/i.test(g))
    return [
      { text: cap(g), dread: 9 },
      { text: "Work on it for 25 minutes", dread: 7 },
      { text: "Work on it for 10 minutes", dread: 5 },
      { text: "Open it and do the very first line", dread: 3 },
      { text: "Just open it and look", dread: 1 },
    ];
  return [
    { text: cap(g), dread: 9 },
    { text: "Do half of it", dread: 7 },
    { text: "Do 10 minutes of it", dread: 5 },
    { text: "Do the first 2 minutes", dread: 3 },
    { text: "Get what you need ready", dread: 1 },
  ];
}

/** "Just above what felt okay last time": the lowest rung harder than the last actual rating; else dread 3. */
export function pickRung(rungs: Rung[], history: Done[]) {
  const last = history[0]?.actual;
  if (last === undefined) return rungs.findIndex((r) => r.dread === 3);
  const target = last;
  const idx = rungs.map((r, i) => ({ r, i })).filter(({ r }) => r.dread > target).sort((a, b) => a.r.dread - b.r.dread)[0]?.i;
  return idx ?? rungs.findIndex((r) => r.dread === 3);
}

export const hardLabel = (n: number) => (n <= 2 ? "Easy" : n <= 4 ? "A little effort" : n <= 6 ? "Some effort" : n <= 8 ? "Really hard" : "Very hard");
