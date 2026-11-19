/** Your psychologist (9.1–9.3). What's shared is chosen per item; private chats never by default. */
import { read, write } from "@/lib/store";

export type Clinician = { code: string; name: string; short: string; first: string; title: string; city: string };
export type Sharing = { mood: boolean; steps: boolean; chats: boolean };
export type Link = { clinician: Clinician; sharing: Sharing; connectedAt: string; nextSession?: string; lastBriefAt?: string };
/** Homework set by the psychologist; they see only done / not done. */
export type Homework = { id: string; text: string; note: string; target?: number; count?: number; done?: boolean; prompt?: { text: string; chips: string[] } };

const LINK = "evo.clinician.v1";
const HOMEWORK = "evo.homework.v1";

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const circle = {
  get: () => read<Link | null>(LINK, null),
  connect: (clinician: Clinician, sharing: Sharing) => write(LINK, { clinician, sharing, connectedAt: new Date().toISOString() } satisfies Link),
  update: (patch: Partial<Link>) => {
    const l = circle.get();
    if (l) write(LINK, { ...l, ...patch });
  },
  disconnect: () => write(LINK, null),
  sharedCount: (s: Sharing) => Object.values(s).filter(Boolean).length,
};

export const homework = {
  all: () => read<Homework[]>(HOMEWORK, []),
  save: (list: Homework[]) => write(HOMEWORK, list),
  tick: (id: string) => {
    const list = homework.all().map((h) => {
      if (h.id !== id) return h;
      if (h.target) {
        const count = Math.min((h.count ?? 0) + 1, h.target);
        return { ...h, count, done: count >= h.target };
      }
      return { ...h, done: !h.done };
    });
    homework.save(list);
    return list;
  },
};

/** "Thursday 4 PM" */
export const sessionLabel = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { weekday: "long" });
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: d.getMinutes() ? "2-digit" : undefined }).replace(":00", "");
  return `${day} ${t}`;
};
