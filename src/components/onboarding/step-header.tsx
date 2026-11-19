"use client";

import { BackButton, ProgressDots } from "@/components/ui/controls";

/** Back + progress for the 4 profile steps (age → weighing → privacy → personalise). */
export function StepHeader({ step, back }: { step?: number; back?: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <BackButton href={back} />
      {step && <ProgressDots step={step} total={4} />}
    </div>
  );
}

export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h1 className="type-screen-title text-forest">{title}</h1>
      {sub && <p className="type-body-m text-t2">{sub}</p>}
    </div>
  );
}
