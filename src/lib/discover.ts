/** Device-only stores for the out-of-the-box features (O2–O11). */
import { read, write } from "@/lib/store";

export type FutureNote = { id: string; at: string; audio?: string; seconds: number; text?: string; when: "low3" | "ask" };
export type Letter = { id: string; at: string; to: string; text: string };
export type Fear = { id: string; at: string; fear: string; predicted: number; experiment: string; when: string; doneAt?: string; happened?: string; actual?: number };
export type SootheKit = { hear: string; taste: string; touch: string; smell: string; quote: string; photo?: string };
export type Joy = { id: string; at: string; prompt: string; photo: string };
export type Sign = { id: string; text: string; kind: "sleep" | "walks" | "custom" };
export type StormPlan = { signs: Sign[]; plan: string[]; tellTrusted: boolean };

const one = <T,>(key: string, fallback: T) => ({ get: () => read<T>(key, fallback), save: (v: T) => write(key, v) });
const list = <T extends { id: string }>(key: string) => ({
  all: () => read<T[]>(key, []),
  add: (x: T) => write(key, [x, ...read<T[]>(key, []).filter((y) => y.id !== x.id)]),
  remove: (id: string) => write(key, read<T[]>(key, []).filter((y) => y.id !== id)),
});

export const notes = list<FutureNote>("evo.futurenotes.v1");
export const letters = list<Letter>("evo.letters.v1");
export const fears = list<Fear>("evo.fears.v1");
export const joys = list<Joy>("evo.joys.v1");
export const kit = one<SootheKit>("evo.soothekit.v1", { hear: "", taste: "", touch: "", smell: "", quote: "" });
export const storm = one<StormPlan>("evo.storm.v1", {
  signs: [
    { id: "sleep", text: "Under 6 h sleep, 3 nights", kind: "sleep" },
    { id: "walks", text: "Skipping your walks", kind: "walks" },
  ],
  plan: [],
  tellTrusted: false,
});
export const tonight = one<{ value: string; step: string; at: string } | null>("evo.compass.tonight.v1", null);
export const uid = () => crypto.randomUUID();

/** Joy-hunt prompts, one per day. */
export const HUNTS = ["Find something that's growing", "Find something blue", "Find a kind word somewhere", "Find light falling on something", "Find something older than you", "Find a small, perfect thing", "Find something that smells good"];
export const huntFor = (d = new Date(), skip = 0) => HUNTS[(Math.floor(d.getTime() / 864e5) + skip) % HUNTS.length];

/** DEAR MAN draft (describe, express, assert, reinforce) from the person's own letter. */
export function dearMan(to: string, text: string) {
  const when = text.match(/\bwhen ([^.,;!?]+)/i)?.[1]?.trim();
  const feel = text.match(/\bI (feel [^.,;!?]+|hear that [^.,;!?]+)/i)?.[1]?.trim();
  const name = to.trim() || "Hey";
  const describe = when ? `when ${when}` : "when this happens";
  const express = feel ? `I ${feel}` : "it's hard for me";
  return `"${name}, ${describe}, ${express}. I'd love it if we could talk about it calmly. Can we try?"`;
}
