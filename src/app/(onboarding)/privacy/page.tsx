"use client";

import { useState } from "react";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useProfile, type Consents } from "@/lib/profile";

const ROWS: { key: keyof Consents; title: string; note: string }[] = [
  { key: "learnPatterns", title: "Learn my patterns", note: "Notice when feelings tend to dip" },
  { key: "headsUp", title: "Heads-up before hard times", note: "A gentle note before a tough evening" },
  { key: "keepVoice", title: "Keep voice recordings", note: "Off: only the text is kept" },
  { key: "shareClinician", title: "Share with my psychologist", note: "Only what you pick, each time" },
];

/** 1.7 · Privacy you control */
export default function Privacy() {
  const { profile, update } = useProfile();
  const [policy, setPolicy] = useState(false);
  const set = (k: keyof Consents, v: boolean) => update({ consents: { ...profile.consents, [k]: v } });

  return (
    <div>
      <StepHeader step={3} back="/onboarding/weighing" />
      <Heading title="You decide what Evo keeps" sub="Change any of these later in You → Privacy." />
      <Card className="gap-0 p-0">
        {ROWS.map((r, i) => (
          <div key={r.key} className={`flex items-center gap-3 p-4 ${i ? "border-t border-line" : ""}`}>
            <div className="flex-1">
              <p className="type-label-m">{r.title}</p>
              <p className="type-body-s text-t3">{r.note}</p>
            </div>
            <Toggle on={profile.consents[r.key]} onChange={(v) => set(r.key, v)} label={r.title} />
          </div>
        ))}
      </Card>
      <button type="button" onClick={() => setPolicy(true)} className="mt-3 cursor-pointer type-label-s text-t2 underline">
        Privacy policy v1.2 · 2-minute read
      </button>
      {policy && (
        <div role="dialog" aria-modal="true" aria-label="Privacy policy" className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 md:items-center">
          <div className="glass flex max-h-[80dvh] w-full max-w-[560px] flex-col gap-3 overflow-auto rounded-[24px] p-6">
            <h2 className="type-title-m">Privacy policy (summary)</h2>
            <p className="type-body-m text-t2">
              Your chats and journal are encrypted. Nothing is shared with anyone unless you choose it, item by item. You can export or delete
              everything at any time. Data is stored in India.
            </p>
            <Pill label="Close" variant="glass" icon={null} height={44} onClick={() => setPolicy(false)} />
          </div>
        </div>
      )}
      <Pill label="Looks good" href="/onboarding/personalise" className="mt-8 w-full" />
    </div>
  );
}
