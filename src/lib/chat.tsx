"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/** How a chat runs (X1 tiles). "night" is chosen automatically late at night (X14). */
export type ChatMode = "talk" | "listen" | "untangle" | "calm" | "night";

export const MODE_LABEL: Record<ChatMode, string> = {
  talk: "Talk it through",
  listen: "Just listening",
  untangle: "Untangle a thought",
  calm: "Calm me first",
  night: "Late-night mode",
};

/** One item in the conversation. Everything Evo shows inline is a part, so a chat replays exactly. */
export type PartBody =
  | { t: "evo"; text: string }
  | { t: "me"; text: string }
  | { t: "chips"; options: string[]; picked?: string; indent?: boolean }
  | { t: "options"; options: string[]; picked?: string }
  | { t: "scale"; label: string; picked?: number }
  | { t: "slider"; label: string; word: string; value: number; done?: boolean }
  | { t: "breath"; done?: boolean; last?: string }
  | { t: "trap"; name: string; note: string; also?: string }
  | { t: "evidence"; supports: string[]; against: string[] }
  | { t: "fairer"; text: string; thought: string; before: number; after?: number; picked?: string }
  | { t: "safety"; quote: string; picked?: string }
  | { t: "phone" }
  | { t: "parked"; what: string; when: string }
  | { t: "status"; text: string }
  | { t: "repair"; picked?: string }
  | { t: "nightChips"; picked?: string }
  | { t: "softcheck"; picked?: string };
export type Part = { id: string } & PartBody;

export type Feeling = { name: string; start: number; end?: number };
export type Step = { text: string; note: string; when: string; doable: number; done?: boolean; doneAt?: string };

export type Chat = {
  id: string;
  mode: ChatMode;
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  /** Short topic ("fight with Amma"), from the user's first message. */
  topic: string;
  parts: Part[];
  /** Tone actually used (X8 repair can switch to listening). */
  listening?: boolean;
  simpler?: boolean;
  feelings: Feeling[];
  thought?: string;
  fairer?: string;
  belief?: [number, number];
  step?: Step;
  leaving?: string;
  checkBack?: boolean;
  shareSummary?: boolean;
  savedToJournal?: boolean;
  insights: string[];
  /** Where the scripted flow is waiting (e.g. "ev-for"); undefined = open conversation. */
  stage?: string;
  /** What the user said supports the thought (X6), kept until they add what doesn't fit. */
  evidenceFor?: string;
  /** Suggestion chips shown above the composer (X3). */
  suggest?: string[];
  /** Reframe kept as a favourite (X13 star). */
  starred?: boolean;
  /** Started from the Voice tab (3.3). */
  voice?: boolean;
  language?: string;
  /** Reactions given on Evo messages (X7), by part id. */
  reactions?: Record<string, "heart" | "star" | "helpful">;
};

const KEY = "evo.chats.v1";

type Ctx = {
  ready: boolean;
  chats: Chat[];
  start: (mode: ChatMode, parts?: PartBody[]) => Chat;
  update: (id: string, fn: (c: Chat) => Chat) => void;
  remove: (id: string) => void;
};

const ChatContext = createContext<Ctx>({ ready: false, chats: [], start: () => ({}) as Chat, update: () => {}, remove: () => {} });

function persist(chats: Chat[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats));
  } catch {}
}

export const pid = () => crypto.randomUUID().slice(0, 8);
export const withIds = (parts: PartBody[]) => parts.map((p) => ({ ...p, id: pid() }) as Part);

/** Client chat store until the chat API lands (build step 15). Private: never leaves the device. */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChats(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
    } catch {}
    setReady(true);
  }, []);

  const start = useCallback((mode: ChatMode, parts: PartBody[] = []) => {
    const now = new Date().toISOString();
    const chat: Chat = { id: crypto.randomUUID(), mode, startedAt: now, updatedAt: now, topic: "", parts: withIds(parts), feelings: [], insights: [], listening: mode === "listen" };
    setChats((prev) => {
      const next = [chat, ...prev];
      persist(next);
      return next;
    });
    return chat;
  }, []);

  const update = useCallback((id: string, fn: (c: Chat) => Chat) => {
    setChats((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...fn(c), updatedAt: new Date().toISOString() } : c));
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return <ChatContext.Provider value={{ ready, chats, start, update, remove }}>{children}</ChatContext.Provider>;
}

export const useChats = () => useContext(ChatContext);

/** "Tonight" / "Today" / weekday — the relative day labels used across the chat screens. */
export function dayLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const days = Math.round((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5);
  if (days === 0) return d.getHours() >= 18 ? "Tonight" : "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-GB", { weekday: "long" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Late-night window for X14 (23:00–04:59). */
export const isLateNight = (d = new Date()) => d.getHours() >= 23 || d.getHours() < 5;
