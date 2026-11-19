"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { cn } from "@/lib/cn";
import { STYLE_HREF, useProfile } from "@/lib/profile";

const DAYS = [
  { id: "rough", label: "Rough", feeling: "Overwhelmed", intensity: 70 },
  { id: "low", label: "Low", feeling: "Sad", intensity: 55 },
  { id: "okay", label: "Okay", feeling: "Okay", intensity: 40 },
  { id: "good", label: "Good", feeling: "Calm", intensity: 30 },
  { id: "great", label: "Great", feeling: "Calm", intensity: 15 },
] as const;

/** C11 · Missed check-in — Figma node 136:3024. No streaks, no guilt; optional one-tap backfill. */
export default function MissedCheckIn() {
  const router = useRouter();
  const toast = useToast();
  const { add } = useCheckIns();
  const { profile } = useProfile();
  const [picked, setPicked] = useState("");

  function backfill(d: (typeof DAYS)[number]) {
    setPicked(d.id);
    add({ style: "quick", feeling: d.feeling, word: d.label.toLowerCase(), intensity: d.intensity, backfill: true });
    toast.show("Added for yesterday");
  }

  return (
    <FigmaScreen gap={14}>
      <div className="h-[100px] w-full" />
      <Grow />
      <div className="flex w-full justify-center">
        <Orb size={110} />
      </div>
      <h1 className="text-center text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">No check-in yesterday — that&apos;s okay.</h1>
      <p className="text-center type-body-m text-t2">Gaps are normal. Want to add how yesterday felt, or just start from today?</p>
      <div className="flex w-full flex-col gap-2.5 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
        <p className="type-label-s text-t3">YESTERDAY, IN ONE TAP (OPTIONAL)</p>
        <div role="radiogroup" aria-label="Yesterday" className="flex gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={picked === d.id}
              disabled={!!picked}
              onClick={() => backfill(d)}
              className={cn("flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-[16px] py-2.5 disabled:cursor-default", picked === d.id ? "border-[1.5px] border-lime bg-lime-soft" : "bg-subtle")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma dot */}
              <img src={`/figma/missed/${d.id}.svg`} alt="" width={16} height={16} />
              <span className="type-caption text-t1">{d.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Grow />
      <Pill label="Check in for today" className="w-full" href={STYLE_HREF[profile.checkinStyle] ?? "/check-in"} />
      <button type="button" onClick={() => router.push("/home")} className="cursor-pointer text-center type-label-m text-t2">
        Skip — no gaps are counted
      </button>
    </FigmaScreen>
  );
}
