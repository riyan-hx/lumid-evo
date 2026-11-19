"use client";

import { useRouter } from "next/navigation";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { useProfile, type AgeBand } from "@/lib/profile";

const OPTIONS: { band: AgeBand; label: string; note: string }[] = [
  { band: "u16", label: "Under 16", note: "A parent or guardian says okay first" },
  { band: "16-17", label: "16 – 17", note: "A parent or guardian says okay first" },
  { band: "18-24", label: "18 – 24", note: "Straight in" },
  { band: "25+", label: "25 or older", note: "Straight in" },
];

/** 1.4 · Age */
export default function Age() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const teen = profile.ageBand === "u16" || profile.ageBand === "16-17";

  return (
    <div>
      <StepHeader step={1} back="/verify" />
      <Heading title="How old are you?" sub="This decides how Evo keeps you safe. It can't be changed later." />
      <div role="radiogroup" aria-label="Age" className="flex flex-col gap-2.5">
        {OPTIONS.map((o) => {
          const on = profile.ageBand === o.band;
          return (
            <button
              key={o.band}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => update({ ageBand: o.band })}
              className={cn(
                "flex cursor-pointer flex-col items-start rounded-[18px] border p-4 text-left transition-colors",
                on ? "border-lime bg-lime-soft" : "glass",
              )}
            >
              <span className="type-title-m text-t1">{o.label}</span>
              <span className="type-body-s text-t3">{o.note}</span>
            </button>
          );
        })}
      </div>
      <Pill
        label="Continue"
        disabled={!profile.ageBand}
        className="mt-8 w-full"
        onClick={() => router.push(teen ? "/guardian" : "/onboarding/weighing")}
      />
    </div>
  );
}
