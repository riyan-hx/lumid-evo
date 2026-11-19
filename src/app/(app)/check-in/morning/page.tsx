"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaSlider, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { cn } from "@/lib/cn";

const SLEEP = ["Badly", "On and off", "Okay", "Well"];
const WAKING: { label: string; feeling: string; intensity: number }[] = [
  { label: "Heavy", feeling: "Sad", intensity: 60 },
  { label: "Anxious", feeling: "Anxious", intensity: 55 },
  { label: "Flat", feeling: "Numb", intensity: 45 },
  { label: "Okay", feeling: "Okay", intensity: 30 },
  { label: "Hopeful", feeling: "Calm", intensity: 20 },
];
const INTENTIONS = ["A walk at lunch", "Call someone", "Eat a real lunch"];

/** C7 · Morning check-in — Figma node 135:3001 */
export default function MorningCheckIn() {
  const router = useRouter();
  const { add } = useCheckIns();
  const [sleep, setSleep] = useState("");
  const [hours, setHours] = useState(6);
  const [waking, setWaking] = useState("");
  const [intention, setIntention] = useState("");

  function save() {
    const w = WAKING.find((x) => x.label === waking) ?? WAKING[3];
    add({ style: "morning", feeling: w.feeling, word: w.label.toLowerCase(), intensity: w.intensity, sleep: sleep ? { quality: sleep, hours } : undefined, intention: intention || undefined });
    router.push("/home");
  }

  return (
    <FigmaScreen gap={12} mood="warm">
      <FlowHeader solid icon="close" label="Close check-in" title="Good morning" sub="Morning check-in · 20 seconds" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">How did you sleep?</h1>
      <div className="flex w-full flex-wrap gap-2">
        {SLEEP.map((s) => (
          <SoftChip key={s} label={s} selected={sleep === s} onClick={() => setSleep(s)} />
        ))}
      </div>
      <FigmaSlider solid trackBg="bg-sky-soft" label="Hours, roughly" valueText={`≈ ${hours} h`} ariaValueText={`about ${hours} hours`} fraction={hours / 12} min={0} max={12} step={1} value={hours} onChange={setHours} />
      <h2 className="type-title-m text-ink">How are you waking up?</h2>
      <div className="flex w-full flex-wrap gap-2">
        {WAKING.map((w) => (
          <SoftChip key={w.label} label={w.label} selected={waking === w.label} onClick={() => setWaking(w.label)} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[22px] p-4" style={{ backgroundImage: "linear-gradient(165.38deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <p className="type-label-s text-lime">ONE THING THAT WOULD MAKE TODAY OKAY</p>
        <div className="flex flex-wrap gap-2">
          {INTENTIONS.map((t) => {
            const on = intention === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setIntention(on ? "" : t)}
                className={cn("cursor-pointer rounded-full px-3 py-2 type-label-s", on ? "text-forest" : "border border-white bg-white/12 text-white")}
                style={on ? { backgroundImage: "var(--gradient-lime)" } : undefined}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <Grow />
      <Pill label="Start my day" className="w-full" onClick={save} />
    </FigmaScreen>
  );
}
