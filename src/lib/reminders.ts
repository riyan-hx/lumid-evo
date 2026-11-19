/** Gentle reminders (9.6): tied to moments, one nudge a day at most. Delivery lands with push (build step 15). */
import { read, write } from "@/lib/store";

export type Reminders = { afterDinner: boolean; beforeBed: boolean; worry: boolean; discreet: boolean; ignored: number };
const KEY = "evo.reminders.v1";
export const DEFAULT_REMINDERS: Reminders = { afterDinner: true, beforeBed: false, worry: false, discreet: false, ignored: 0 };

export const reminders = {
  get: () => ({ ...DEFAULT_REMINDERS, ...read<Partial<Reminders>>(KEY, {}) }),
  save: (r: Reminders) => write(KEY, r),
};
