import type { Chat } from "./chat";

export type Insight = { title: string; happening: string; why: string; help: string; confidence: "Low" | "Medium" | "High"; basedOn: number; topic: string };

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const top = <T,>(xs: T[]) => [...xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<T, number>())].sort((a, b) => b[1] - a[1])[0];

/** 3.4 · one honest pattern from the user's own chats; null until there are 3+ chats. */
export function noticePattern(chats: Chat[]): Insight | null {
  const real = chats.filter((c) => c.parts.some((p) => p.t === "me"));
  if (real.length < 3) return null;
  const [topic, n] = top(real.map((c) => c.topic).filter(Boolean)) ?? ["", 0];
  const feeling = top(real.flatMap((c) => c.feelings.map((f) => f.name.toLowerCase())))?.[0];
  const trap = top(real.flatMap((c) => c.parts.flatMap((p) => (p.t === "trap" ? [p.name] : []))))?.[0];
  const shifts = real.filter((c) => c.belief).map((c) => c.belief![0] - c.belief![1]);
  const avg = shifts.length ? Math.round(shifts.reduce((a, b) => a + b, 0) / shifts.length) : 0;
  const N = real.length;
  return {
    topic: topic || "your days",
    title: topic && feeling ? `When ${topic} comes up, you feel ${feeling} — and it stays with you for a while.` : `Hard moments tend to stay with you — talking them through helps them settle.`,
    happening: topic ? `${cap(topic)} came up in ${n} of your last ${N} chats.` : `You've talked with Evo ${N} times recently.`,
    why: trap ? `Your mind often slips into ${trap.toLowerCase()} — it's common when you're hurt.` : feeling ? `Feeling ${feeling} shows up most when this comes up.` : "Some feelings come back until they're named.",
    help: avg > 0 ? `Your fairer thoughts lowered belief by about ${avg} points — keep using them.` : "Naming the feeling early, and one small step when you're ready.",
    confidence: N >= 8 ? "High" : N >= 5 ? "Medium" : "Low",
    basedOn: N,
  };
}

export type Answer = { text: string; evidence: string; confidence: string; tryThis: string; action?: { label: string; href: string } };

/** 3.5 · on-device answers to questions about an insight (the server model takes over in step 15). */
export function askEvo(q: string, ctx: { about: string; basedOn: number; confidence: string }): Answer {
  const base = { evidence: `Your last ${ctx.basedOn} chats`, confidence: ctx.confidence };
  if (/sleep|tired|night/i.test(q + ctx.about))
    return { ...base, text: "When you're short on sleep, the part of your brain that spots threats gets louder and the part that calms it gets quieter. So the same worry feels bigger.", tryThis: "A wind-down at 11 PM, 3 nights", action: { label: "Plan a wind-down", href: "/calm?tool=wind-down" } };
  if (/what (can|should) i do|help|fix|stop/i.test(q))
    return { ...base, text: "Start small: notice the feeling early, name it, then take one tiny step. Small steps done often beat big plans.", tryThis: "One 2-minute step today", action: { label: "Pick a small step", href: "/chat/live?mode=talk&q=" + encodeURIComponent("I want advice") } };
  if (/why/i.test(q))
    return { ...base, text: "Things that touch what matters to us hit harder — and the mind replays them to try to make sense of them. That's normal, and it eases when the feeling is named.", tryThis: "Name the feeling the next time it starts", action: { label: "Untangle a thought", href: "/chat/live?mode=untangle" } };
  return { ...base, text: "Good question. I can only see what you've shared with me, so I'd rather explore it with you than guess.", tryThis: "Talk it through for a few minutes" };
}
