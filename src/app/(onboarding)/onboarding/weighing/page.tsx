"use client";

import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";

const CONCERNS = ["Anxious or on edge", "Low or empty", "Overwhelmed", "Stuck, can't start", "Lonely", "Can't sleep", "Angry or irritable", "Relationships"];

/** 1.6 · What's been weighing on you */
export default function Weighing() {
  const { profile, update } = useProfile();
  const toggle = (c: string) =>
    update({ concerns: profile.concerns.includes(c) ? profile.concerns.filter((x) => x !== c) : [...profile.concerns, c] });

  return (
    <div>
      <StepHeader step={2} back="/age" />
      <Heading title="What's been weighing on you?" sub="Pick any. It helps Evo suggest the right things first." />
      <div className="flex flex-wrap gap-2">
        {CONCERNS.map((c) => (
          <SoftChip key={c} label={c} selected={profile.concerns.includes(c)} onClick={() => toggle(c)} />
        ))}
      </div>
      <Pill label={profile.concerns.length ? "Continue" : "Skip for now"} href="/privacy" className="mt-8 w-full" />
    </div>
  );
}
