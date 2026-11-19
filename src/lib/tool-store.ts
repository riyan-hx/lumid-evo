/** Device-only stores for the flow 5 tools (build step 15 moves them to the API). */
export type Activity = { id: string; at: string; kind: ActivityKind; text: string; guess: number; when: string; actual?: number; mood?: string; reviewedAt?: string };
export type ActivityKind = "walk" | "call" | "chai" | "song";
export type Worry = { id: string; at: string; text: string; control?: "can" | "cant"; action?: string; parkedUntil?: string; doneAt?: string };
export type Problem = { id: string; at: string; problem: string; ideas: string[]; pick: string; step: string; when: string };
export type Compass = { values: string[]; why: string; step: string; voice?: boolean; at: string };
export type GoodThing = { id: string; at: string; text: string; why: string; kind: "leaf" | "people"; photo?: string };

const KEYS = { activities: "evo.activities.v1", worries: "evo.worries.v1", problems: "evo.problems.v1", compass: "evo.compass.v1", good: "evo.good.v1", kind: "evo.kindpauses.v1" } as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export const activities = {
  all: () => read<Activity[]>(KEYS.activities, []),
  add: (a: Omit<Activity, "id" | "at">) => {
    const x = { ...a, id: id(), at: now() };
    write(KEYS.activities, [x, ...activities.all()]);
    return x;
  },
  update: (aid: string, patch: Partial<Activity>) => write(KEYS.activities, activities.all().map((a) => (a.id === aid ? { ...a, ...patch } : a))),
};

export const worries = {
  all: () => read<Worry[]>(KEYS.worries, []),
  save: (list: Worry[]) => write(KEYS.worries, list),
  make: (text: string): Worry => ({ id: id(), at: now(), text }),
};

export const problems = {
  all: () => read<Problem[]>(KEYS.problems, []),
  add: (p: Omit<Problem, "id" | "at">) => write(KEYS.problems, [{ ...p, id: id(), at: now() }, ...problems.all()]),
};

export const compass = {
  get: () => read<Compass | null>(KEYS.compass, null),
  save: (c: Omit<Compass, "at">) => write(KEYS.compass, { ...c, at: now() }),
};

export const goodThings = {
  all: () => read<GoodThing[]>(KEYS.good, []),
  save: (list: GoodThing[]) => write(KEYS.good, list),
  make: (g: Omit<GoodThing, "id" | "at">): GoodThing => ({ ...g, id: id(), at: now() }),
};

export const kindPauses = {
  count: () => read<number>(KEYS.kind, 0),
  add: () => write(KEYS.kind, kindPauses.count() + 1),
};

/** "6:30" from "18:30". */
export const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
};

/** Default action when a worry is something you can act on. */
export function actionFor(text: string) {
  const t = text.toLowerCase();
  if (/(money|rent|bill|loan|fee|salary)/.test(t)) return "make a plan";
  if (/(health|sick|doctor|hospital|pain)/.test(t)) return /(amma|mum|mom|dad|achan|her|his)/.test(t) ? "ask the doctor" : "book a check-up";
  if (/(exam|study|work|deadline|project|meeting)/.test(t)) return "write the first step";
  if (/(friend|fight|sorry|amma|mum|dad|partner)/.test(t)) return "say one honest line";
  return "pick one small step";
}

/** Gentle trade-off note for an idea (5.4). */
export function ideaNote(text: string) {
  const t = text.toLowerCase();
  if (/(ask|talk|tell|email|message|extension)/.test(t)) return "Doable · low risk";
  if (/(extra|shift|overtime|work more|sell)/.test(t)) return "Tiring · takes time";
  if (/(borrow|loan|lend)/.test(t)) return "Awkward · fast";
  if (/(ignore|wait|nothing)/.test(t)) return "Easy now · may grow";
  return "Worth a try";
}
