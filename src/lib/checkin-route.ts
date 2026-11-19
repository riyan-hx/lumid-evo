/** Where "Check in" goes (Figma app tree, C branch): missed day → C11, 7–10 am → C7, after 7 pm → C8, else the chosen style (C1). */
import type { CheckIn } from "@/lib/checkins";
import { type CheckinStyle, STYLE_HREF } from "@/lib/profile";
import { read } from "@/lib/store";

const day = (d: Date) => d.toDateString();
export const MISSED_SEEN = "evo.missed.seen.v1";

export function checkinHref(style: CheckinStyle, items: CheckIn[], now = new Date()): string {
  const today = day(now);
  const yesterday = day(new Date(now.getTime() - 864e5));
  const real = items.filter((c) => !c.backfill);
  const last = items[0];
  const missedYesterday = real.length > 0 && !!last && day(new Date(last.at)) !== today && day(new Date(last.at)) !== yesterday;
  if (missedYesterday && read<string>(MISSED_SEEN, "") !== today) return "/check-in/missed";
  const doneToday = (s: CheckIn["style"]) => items.some((c) => c.style === s && day(new Date(c.at)) === today);
  const h = now.getHours();
  if (h >= 7 && h < 10 && !doneToday("morning")) return "/check-in/morning";
  if (h >= 19 && !doneToday("evening")) return "/check-in/evening";
  return STYLE_HREF[style] ?? "/check-in";
}

const LOW = /sad|low|hopeless|empty|numb|down|tired|drained|flat|lonely/i;
export const TWO_WEEK_DONE = "evo.twoweek.done.v1";

/** C9 trigger "2 weeks low": low on most days with a check-in in the last 14 days, and no two-week check in that time. */
export function twoWeeksLow(items: CheckIn[], now = Date.now()) {
  const recent = items.filter((c) => now - new Date(c.at).getTime() < 14 * 864e5);
  const days = new Map<string, boolean>();
  recent.forEach((c) => days.set(new Date(c.at).toDateString(), (days.get(new Date(c.at).toDateString()) ?? false) || LOW.test(c.word || c.feeling)));
  const lowDays = [...days.values()].filter(Boolean).length;
  const done = read<string>(TWO_WEEK_DONE, "");
  const doneRecently = !!done && now - new Date(done).getTime() < 14 * 864e5;
  return days.size >= 5 && lowDays / days.size > 0.6 && !doneRecently;
}
