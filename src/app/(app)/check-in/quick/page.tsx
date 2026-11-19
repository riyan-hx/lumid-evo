"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { useCheckIns } from "@/lib/checkins";
import { cn } from "@/lib/cn";

const MOODS = [
  { id: "rough", label: "Rough", feeling: "Overwhelmed", intensity: 75 },
  { id: "low", label: "Low", feeling: "Sad", intensity: 55 },
  { id: "okay", label: "Okay", feeling: "Okay", intensity: 40 },
  { id: "good", label: "Good", feeling: "Calm", intensity: 30 },
  { id: "great", label: "Great", feeling: "Calm", intensity: 15 },
] as const;

const part = (h: number) => (h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");

/**
 * C2 · Quick check-in — Figma node 134:2859. A lock-screen widget on mobile (native, phase 2);
 * on the web it's this one-tap page, reachable from a push notification or the Home brief.
 */
export default function QuickCheckIn() {
  const router = useRouter();
  const toast = useToast();
  const { items, add } = useCheckIns();
  const [now, setNow] = useState(() => new Date());
  const [picked, setPicked] = useState<string>("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  function pick(m: (typeof MOODS)[number]) {
    setPicked(m.id);
    add({ style: "quick", feeling: m.feeling, word: m.label.toLowerCase(), intensity: m.intensity });
    // Two "Rough" taps in one day → the safety-aware response (C13) instead of a toast.
    const roughToday = items.filter((c) => c.style === "quick" && c.word === "rough" && new Date(c.at).toDateString() === now.toDateString()).length;
    if (m.id === "rough" && roughToday >= 1) return router.push("/check-in/low");
    toast.show("Thanks — saved. Add more later, or never.");
    setTimeout(() => router.push("/home"), 900);
  }

  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: false }).format(now);

  return (
    <FigmaScreen gap={12} pt={70} mood="night">
      <p className="text-center type-body-m text-lime-soft">{date}</p>
      <p className="text-center text-[88px] leading-none font-medium tracking-[-2.2px] text-white">{time}</p>
      <Grow />
      <div className="flex w-full flex-col gap-3 rounded-[28px] border border-white/20 bg-white/12 p-4 backdrop-blur-[12px]">
        <div className="flex items-center gap-2.5">
          <Orb size={28} />
          <p className="flex-1 type-label-s text-lime">Evo · How&apos;s your {part(now.getHours())}?</p>
        </div>
        <div role="radiogroup" aria-label="Mood" className="flex w-full gap-1.5">
          {MOODS.map((m) => {
            const on = picked === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(m)}
                className={cn("flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-[16px] py-2.5", on ? "bg-sun-soft" : "bg-white/8")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Figma mood dot */}
                <img src={`/figma/quick/${m.id}.svg`} alt="" width={18} height={18} />
                <span className={cn("type-caption", on ? "text-ink" : "text-white/85")}>{m.label}</span>
              </button>
            );
          })}
        </div>
        <p className="type-caption text-white/60">Tap once. Add more later, or never.</p>
      </div>
      <div className="flex w-full justify-center">
        <span className="h-[5px] w-[140px] rounded-[3px] bg-surface" />
      </div>
    </FigmaScreen>
  );
}
