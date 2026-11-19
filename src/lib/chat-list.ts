import { type Chat, MODE_LABEL } from "./chat";

/** Row time: "9:12 PM" today, "Tue" this week, "19 Nov" otherwise. */
export function rowTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const days = (new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5;
  if (days === 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const isRecord = (c: Chat) => !!(c.thought && c.fairer);

/** 3.6 row: icon, title and caption that say what the chat was. */
export function chatRow(c: Chat) {
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const felt = c.leaving ? ` · felt ${c.leaving.toLowerCase() === "same" ? "the same" : `a bit ${c.leaving.toLowerCase()}`}` : "";
  if (isRecord(c)) {
    const core = c.thought!.match(/\bi'?m [^.,!?]+/i)?.[0] ?? c.topic;
    return { icon: "brain-lav-19", bg: "bg-lavender-soft", title: `"${cap(core)}" — thought record`, note: c.belief ? `Belief ${c.belief[0]} → ${c.belief[1]}` : "Thought record" };
  }
  if (c.mode === "listen") return { icon: "heart-peach-19", bg: "bg-peach-soft", title: cap(c.topic || "Just listening"), note: `Listening mode${felt}` };
  if (c.mode === "calm") {
    const f = c.feelings[0];
    return { icon: "wind-mint-19", bg: "bg-mint-soft", title: "Breathing, 1 minute", note: f?.end !== undefined ? `${f.name} ${f.start} → ${f.end}` : `Calm me first${felt}` };
  }
  return { icon: "chat-sky-19", bg: "bg-sky-soft", title: cap(c.topic || "Chat with Evo"), note: `${MODE_LABEL[c.mode]}${felt}` };
}

export function matches(c: Chat, q: string) {
  if (!q) return true;
  const s = q.toLowerCase();
  return c.topic.toLowerCase().includes(s) || c.parts.some((p) => "text" in p && p.text.toLowerCase().includes(s));
}
