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
};

const KEY = "evo.checkins.v1";
type Ctx = { items: CheckIn[]; add: (c: Omit<CheckIn, "id" | "at">) => CheckIn; remove: (id: string) => void };
const CheckInContext = createContext<Ctx>({ items: [], add: () => ({}) as CheckIn, remove: () => {} });

function persist(items: CheckIn[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

/** Client check-in store until POST /api/check-ins lands (build step 15). Works offline. */
export function CheckInProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CheckIn[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
    } catch {}
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

  return <CheckInContext.Provider value={{ items, add, remove }}>{children}</CheckInContext.Provider>;
}

export const useCheckIns = () => useContext(CheckInContext);
