/** Lines for the pre-session brief (9.2), built only from the person's own data from the last 7 days. */
import type { CheckIn } from "@/lib/checkins";
import { loadLadder } from "@/lib/ladder";
import { read } from "@/lib/store";
import { loadRecords } from "@/lib/thoughts";
import { activities } from "@/lib/tool-store";

export type BriefLine = { key: "mood" | "thought" | "steps"; title: string; note: string };

const WEEK = 7 * 864e5;
const CALM = /calm|okay|good|content|peaceful|relaxed/i;
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];
const times = (n: number) => (n === 1 ? "once" : n === 2 ? "twice" : `${n} times`);

export function briefLines(now = Date.now()): BriefLine[] {
  const recent = (iso: string) => now - new Date(iso).getTime() < WEEK;
  const lines: BriefLine[] = [];

  const checks = read<CheckIn[]>("evo.checkins.v1", []).filter((c) => recent(c.at));
  if (checks.length) {
    const tally = new Map<string, number>();
    checks.forEach((c) => tally.set(c.feeling, (tally.get(c.feeling) ?? 0) + 1));
    const top = [...tally].sort((a, b) => b[1] - a[1])[0][0];
    const calmer = checks.filter((c) => CALM.test(c.feeling) && new Date(c.at).getHours() >= 17).length;
    const tail = !CALM.test(top) && calmer ? `; ${WORDS[Math.min(calmer, 7)]} calmer ${calmer === 1 ? "evening" : "evenings"}` : "";
    lines.push({ key: "mood", title: "Mood this week", note: `Mostly ${top.toLowerCase()}${tail}` });
  }

  const tr = loadRecords().find((r) => recent(r.at));
  if (tr) lines.push({ key: "thought", title: "Thought record", note: `"${tr.hot}" · belief ${tr.belief}${tr.beliefAfter !== undefined ? ` → ${tr.beliefAfter}` : ""}` });

  const steps = (loadLadder()?.history ?? []).filter((h) => recent(h.at)).map((h) => h.text);
  const walks = activities.all().filter((a) => a.kind === "walk" && a.actual !== undefined && recent(a.at)).length;
  const faced = [...steps.slice(0, 2), walks ? `walked ${times(walks)}` : ""].filter(Boolean);
  if (faced.length) lines.push({ key: "steps", title: "Steps faced", note: faced.join(" · ") });

  return lines;
}
