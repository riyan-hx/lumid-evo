/** Safety plan, trusted contact and the 24-hour pause (flow 8). Device-only and available offline. */
export type PlanKey = "signs" | "alone" | "places" | "people" | "pros" | "space";
export type SafetyPlan = Record<PlanKey, string> & { reason: string; updatedAt?: string };
export type Trusted = { name: string; relation: string; phone: string; message: string };
export type SafetyState = { pausedUntil?: string; startedAt?: string; returnShown?: boolean; roughStepDone?: string };

const PLAN = "evo.safetyplan.v1";
const TRUSTED = "evo.trusted.v1";
const STATE = "evo.safety.v1";

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export const PLAN_STEPS: { key: PlanKey; title: string; hint: string }[] = [
  { key: "signs", title: "My warning signs", hint: "e.g. not sleeping, cancelling plans" },
  { key: "alone", title: "Things I can do alone", hint: "e.g. cold shower, a playlist, a walk" },
  { key: "places", title: "People and places that help", hint: "e.g. a friend, the library" },
  { key: "people", title: "People I can ask for help", hint: "Names, and who they are to you" },
  { key: "pros", title: "Professionals", hint: "Your doctor or counsellor" },
  { key: "space", title: "Making my space safer", hint: "e.g. medicines kept with family" },
];

export const EMPTY_PLAN: SafetyPlan = { signs: "", alone: "", places: "", people: "", pros: "Tele-MANAS 14416 · 112", space: "", reason: "" };
export const plan = { get: () => read<SafetyPlan>(PLAN, EMPTY_PLAN), save: (p: SafetyPlan) => write(PLAN, { ...p, updatedAt: new Date().toISOString() }) };

export const DEFAULT_MESSAGE = "Rough night. Can you call me when you see this? Nothing to explain.";
export const trusted = {
  get: (): Trusted | null => {
    const t = read<Trusted | null>(TRUSTED, null);
    return t?.phone ? t : null;
  },
  save: (t: Trusted) => write(TRUSTED, t),
};

/** Opening a safety screen pauses suggestions for 24 hours (Home switches to rough-day mode). */
export const safety = {
  get: () => read<SafetyState>(STATE, {}),
  pause: () => {
    const s = safety.get();
    const active = s.pausedUntil && new Date(s.pausedUntil) > new Date();
    if (active) return;
    write(STATE, { startedAt: new Date().toISOString(), pausedUntil: new Date(Date.now() + 864e5).toISOString(), returnShown: false });
  },
  isPaused: (now = Date.now()) => {
    const u = safety.get().pausedUntil;
    return !!u && new Date(u).getTime() > now;
  },
  /** After a pause ends, the next Home visit shows the gentle return (8.8) once. */
  needsReturn: (now = Date.now()) => {
    const s = safety.get();
    return !!s.pausedUntil && new Date(s.pausedUntil).getTime() <= now && !s.returnShown;
  },
  markReturned: () => write(STATE, { ...safety.get(), returnShown: true }),
  endPause: () => write(STATE, { ...safety.get(), pausedUntil: new Date().toISOString(), returnShown: true }),
  stepDone: () => write(STATE, { ...safety.get(), roughStepDone: new Date().toDateString() }),
};

/** Explicit risk → full-screen safety moment (8.3). Ambiguous risk stays in the chat (X12). */
export const CLEAR_RISK = /(kill (myself|me)|suicid|end (it all|my life)|(don'?t|do not|not) want to (wake up|be alive|live|be here)|want to die|hurt(ing)? myself|self[- ]?harm)/i;
/** Heavy but not explicit → soft check-in card (8.2). */
export const HEAVY = /(can'?t keep (doing|going on with) this|can'?t do this anymore|i give up|nothing matters|so tired of (everything|it all)|what'?s even the point)/i;
