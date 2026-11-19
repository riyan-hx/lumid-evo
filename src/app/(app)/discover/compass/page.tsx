"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CARD, OHeader } from "@/components/discover/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { tonight } from "@/lib/discover";

type V = "Family" | "Health" | "Growth" | "Rest";
const VALUES: { v: V; deg: number; pos: string; chip: string; on: string }[] = [
  { v: "Family", deg: 0, pos: "left-1/2 -translate-x-1/2 top-1.5", chip: "bg-lavender-soft text-lavender-text", on: "bg-lime-deep text-white" },
  { v: "Health", deg: 90, pos: "right-0 top-[116px]", chip: "bg-mint-soft text-mint-text", on: "bg-lime-deep text-white" },
  { v: "Growth", deg: 180, pos: "left-1/2 -translate-x-1/2 top-[226px]", chip: "bg-sky-soft text-sky-text", on: "bg-lime-deep text-white" },
  { v: "Rest", deg: 270, pos: "left-0 top-[116px]", chip: "bg-lavender-soft text-lavender-text", on: "bg-lime-deep text-white" },
];
const STEPS: Record<V, string[]> = {
  Family: ["Sit with family for tea", "Send someone a funny photo", "Ask someone about their day"],
  Health: ["A 10-minute walk", "Water and a stretch", "Lights out by 11"],
  Growth: ["Read 5 pages", "Learn one small thing", "Write tomorrow's first step"],
  Rest: ["Phone in another room", "A warm shower", "Lie down, no screen, 5 min"],
};

/** O11 · Values compass — Figma node 147:4016. Pick a direction, then one small step towards it tonight. */
export default function Compass() {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState<V>("Family");
  const [step, setStep] = useState(STEPS.Family[0]);
  const deg = VALUES.find((x) => x.v === value)!.deg;

  return (
    <FigmaScreen gap={12}>
      <OHeader icon="close" label="Close" title="Values compass" sub="30 seconds · for tonight" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">Which direction matters most tonight?</h1>
      <p className="type-body-m text-t2">Not what you should do — what you care about.</p>
      <div className="flex w-full justify-center">
        <div className="relative size-[260px]" role="radiogroup" aria-label="Values">
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma compass ring (incl. shadow bleed) */}
          <img src="/figma/compass/ring.svg" alt="" aria-hidden width={320} height={320} className="pointer-events-none absolute max-w-none" style={{ left: -30, top: -18 }} />
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma inner disc */}
          <img src="/figma/compass/inner.svg" alt="" aria-hidden width={150} height={150} className="pointer-events-none absolute left-[55px] top-[55px]" />
          <div className="absolute inset-0 transition-transform duration-500 ease-(--ease-out-evo)" style={{ transform: `rotate(${deg}deg)` }} aria-hidden>
            <div className="absolute left-[126px] top-[38px] h-[92px] w-2 rounded-[4px]" style={{ backgroundImage: "var(--gradient-lime)" }} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma hub */}
          <img src="/figma/compass/hub.svg" alt="" aria-hidden width={24} height={24} className="pointer-events-none absolute left-[118px] top-[118px]" />
          {VALUES.map((x) => (
            <button
              key={x.v}
              type="button"
              role="radio"
              aria-checked={value === x.v}
              onClick={() => {
                setValue(x.v);
                setStep(STEPS[x.v][0]);
              }}
              className={cn("absolute cursor-pointer rounded-full px-2.5 py-[5px] type-label-s", x.pos, value === x.v ? x.on : x.chip)}
            >
              {x.v}
            </button>
          ))}
        </div>
      </div>
      <div className={cn("flex w-full flex-col gap-2 rounded-[20px] p-3.5", CARD)}>
        <p className="type-label-s text-lime-deep">ONE STEP TOWARDS {value.toUpperCase()}, TONIGHT</p>
        <div className="flex flex-wrap gap-2">
          {STEPS[value].map((s) => (
            <SoftChip key={s} label={s} selected={step === s} onClick={() => setStep(s)} />
          ))}
        </div>
      </div>
      <Grow />
      <Pill
        label="I'll do this"
        className="w-full"
        onClick={() => {
          tonight.save({ value, step, at: new Date().toISOString() });
          toast.show(`Tonight: ${step.toLowerCase()}.`);
          router.push("/home");
        }}
      />
    </FigmaScreen>
  );
}
