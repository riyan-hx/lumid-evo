/** What Evo remembers (9.5). Nothing is kept until the person approves it; every line can be edited or removed. */
import { read, write } from "@/lib/store";

export type Memory = { id: string; text: string; source: string; at: string };
type State = { saved: Memory[]; declined: string[]; pending: Omit<Memory, "id">[] };

const KEY = "evo.memory.v1";
const get = () => read<State>(KEY, { saved: [], declined: [], pending: [] });
const known = (s: State, text: string) => s.saved.some((m) => m.text === text) || s.declined.includes(text) || s.pending.some((p) => p.text === text);

export const memory = {
  saved: () => get().saved,
  /** Next suggestion waiting for a yes / no. */
  next: () => get().pending[0] ?? null,
  /** Tools and chats call this; duplicates and declined lines are ignored. */
  propose: (text: string, source: string) => {
    const s = get();
    if (!text.trim() || known(s, text)) return;
    write(KEY, { ...s, pending: [...s.pending, { text, source, at: new Date().toISOString() }] });
  },
  decide: (keep: boolean) => {
    const s = get();
    const [first, ...rest] = s.pending;
    if (!first) return;
    write(KEY, keep ? { ...s, pending: rest, saved: [{ ...first, id: crypto.randomUUID() }, ...s.saved] } : { ...s, pending: rest, declined: [...s.declined, first.text] });
  },
  edit: (id: string, text: string) => {
    const s = get();
    write(KEY, { ...s, saved: s.saved.map((m) => (m.id === id ? { ...m, text } : m)) });
  },
  remove: (id: string) => {
    const s = get();
    write(KEY, { ...s, saved: s.saved.filter((m) => m.id !== id) });
  },
};

const KIND_LINE: Record<string, string> = { walk: "A walk lifts my mood.", call: "Talking to a friend lifts my mood.", chai: "A chai break lifts my mood.", song: "Music lifts my mood." };
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** Suggestions from the person's own data. Only proposed; nothing is kept without a yes. */
export function suggestFromData(sources: { balanced?: { text: string; at: string }; lifts: { kind: string; at: string }[]; language?: string }) {
  if (sources.balanced) memory.propose(`"${sources.balanced.text}"`, `From ${new Date(sources.balanced.at).toLocaleDateString("en-GB", { weekday: "long" })}'s thought record`);
  for (const a of sources.lifts) if (KIND_LINE[a.kind]) memory.propose(KIND_LINE[a.kind], `From your activities · ${day(a.at)}`);
  if (sources.language && sources.language !== "English") memory.propose(`Prefers ${sources.language} for chats.`, "From Settings");
}
