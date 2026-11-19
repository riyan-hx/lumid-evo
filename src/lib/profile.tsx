"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type AgeBand = "u16" | "16-17" | "18-24" | "25+";
export type Reminder = "after-dinner" | "before-bed" | "none";
export type Consents = { learnPatterns: boolean; headsUp: boolean; keepVoice: boolean; shareClinician: boolean };

export type Profile = {
  phone: string;
  name: string;
  ageBand: AgeBand | null;
  guardianPhone: string;
  concerns: string[];
  consents: Consents;
  locales: string[];
  discreet: boolean;
  appLock: boolean;
  reminder: Reminder;
  checkinStyle: CheckinStyle;
  onboarded: boolean;
};

export type CheckinStyle = "quick" | "meter" | "wheel" | "voice" | "body" | "classic";

/** Route for each check-in style (C1). */
export const STYLE_HREF: Record<CheckinStyle, string> = {
  quick: "/check-in/quick",
  meter: "/check-in/meter",
  wheel: "/check-in/wheel",
  voice: "/check-in/voice",
  body: "/check-in/body",
  classic: "/check-in",
};

export const DEFAULT_PROFILE: Profile = {
  phone: "",
  name: "",
  ageBand: null,
  guardianPhone: "",
  concerns: [],
  consents: { learnPatterns: true, headsUp: true, keepVoice: false, shareClinician: false },
  locales: ["English"],
  discreet: false,
  appLock: false,
  reminder: "after-dinner",
  checkinStyle: "classic",
  onboarded: false,
};

const KEY = "evo.profile.v1";

type Ctx = { profile: Profile; update: (patch: Partial<Profile>) => void; reset: () => void };
const ProfileContext = createContext<Ctx>({ profile: DEFAULT_PROFILE, update: () => {}, reset: () => {} });

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

/** Client profile until the API lands (build step 15). Persisted per browser; safe if storage is blocked. */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const hydrated = useRef(false);
  const path = usePathname();

  // Hydrate from storage after mount so server and client render the same first frame.
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setProfile(load());
    }
  }, []);

  // Discreet mode: neutral tab title (Dev Docs board 02). Next.js rewrites <title> on navigation,
  // so keep it neutral whenever the head changes.
  useEffect(() => {
    if (!profile.discreet) return;
    const enforce = () => {
      if (document.title !== "Planner") document.title = "Planner";
    };
    enforce();
    const obs = new MutationObserver(enforce);
    obs.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => obs.disconnect();
  }, [profile.discreet, path]);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => {
      // Child effects can run before hydration: never overwrite stored data with defaults.
      const base = hydrated.current ? p : load();
      hydrated.current = true;
      const next = { ...base, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setProfile(DEFAULT_PROFILE);
  }, []);

  return <ProfileContext.Provider value={{ profile, update, reset }}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);
