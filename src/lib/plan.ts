/** Evo Free / Plus (9.9–9.10). Help is never paywalled; a failed renewal keeps Plus for 3 days. */
import type { PlanId } from "@/lib/api/billing";
import { read, write } from "@/lib/store";

export type Sub = { tier: "free" | "plus"; plan?: PlanId; graceUntil?: string };
const KEY = "evo.plan.v1";
export const GRACE_DAYS = 3;

export const sub = {
  get: () => read<Sub>(KEY, { tier: "free" }),
  activate: (plan: PlanId) => write(KEY, { tier: "plus", plan } satisfies Sub),
  /** Renewal failed: keep Plus on for GRACE_DAYS (only if they had it). */
  failed: () => {
    const s = sub.get();
    if (s.tier === "plus" && !s.graceUntil) write(KEY, { ...s, graceUntil: new Date(Date.now() + GRACE_DAYS * 864e5).toISOString() });
  },
  free: () => write(KEY, { tier: "free" } satisfies Sub),
  isPlus: (now = Date.now()) => {
    const s = sub.get();
    return s.tier === "plus" && (!s.graceUntil || new Date(s.graceUntil).getTime() > now);
  },
};
