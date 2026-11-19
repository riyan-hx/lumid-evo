"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type CheckIn = {
  id: string;
  at: string; // ISO
  style: "classic" | "meter" | "wheel" | "voice" | "body" | "quick" | "morning" | "evening";
  feeling: string;
  word?: string;
  intensity: number; // 0–100
  energy?: number; // 0–4
  body?: string[];
  causes?: string[];
  note?: string;
  halt?: string[];
  sleep?: { quality: string; hours: number };
  intention?: string;
  backfill?: boolean;
};

/** Before → after for a tool (C10). Feeds "Evo learns" and the router. */
export type Rerate = { id: string; at: string; tool: string; measure: string; before: number; after: number };

const KEY = "evo.checkins.v1";
const RKEY = "evo.rerates.v1";
type Ctx = {
  items: CheckIn[];
  add: (c: Omit<CheckIn, "id" | "at">) => CheckIn;
  remove: (id: string) => void;
  rerates: Rerate[];
  addRerate: (r: Omit<Rerate, "id" | "at">) => void;
};
const CheckInContext = createContext<Ctx>({ items: [], add: () => ({}) as CheckIn, remove: () => {}, rerates: [], addRerate: () => {} });

function persist(items: CheckIn[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

/** Client check-in store until POST /api/check-ins lands (build step 15). Works offline. */
export function CheckInProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [rerates, setRerates] = useState<Rerate[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
      const rr = localStorage.getItem(RKEY);
      if (rr) setRerates(JSON.parse(rr));
    } catch {}
  }, []);

  const addRerate = useCallback((r: Omit<Rerate, "id" | "at">) => {
    setRerates((prev) => {
      const next = [{ ...r, id: crypto.randomUUID(), at: new Date().toISOString() }, ...prev];
      try {
        localStorage.setItem(RKEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const add = useCallback((c: Omit<CheckIn, "id" | "at">) => {
    const item: CheckIn = { ...c, id: crypto.randomUUID(), at: new Date().toISOString() };
    setItems((prev) => {
      const next = [item, ...prev];
      persist(next);
      return next;
    });
    return item;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return <CheckInContext.Provider value={{ items, add, remove, rerates, addRerate }}>{children}</CheckInContext.Provider>;
}

export const useCheckIns = () => useContext(CheckInContext);
