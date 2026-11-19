"use client";

import { useState } from "react";
import { BackRow, Body, FigmaToggle, RowCard, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { useProfile, type Consents } from "@/lib/profile";

const ROWS: { key: keyof Consents; icon: string; bg: string; title: string; note: string }[] = [
  { key: "learnPatterns", icon: "brain-lav-19", bg: "bg-lavender-soft", title: "Learn my patterns", note: "Notice when feelings tend to dip" },
  { key: "headsUp", icon: "sunrise-sun", bg: "bg-sun-soft", title: "Heads-up before hard times", note: "A gentle note before a tough evening" },
  { key: "keepVoice", icon: "mic-sky", bg: "bg-sky-soft", title: "Keep voice recordings", note: "Off: only the text is kept" },
  { key: "shareClinician", icon: "stethoscope-mint", bg: "bg-mint-soft", title: "Share with my psychologist", note: "Only what you pick, each time" },
];

/** 1.7 · Privacy you control — Figma node 113:1477 */
export default function Privacy() {
  const { profile, update } = useProfile();
  const [policy, setPolicy] = useState(false);

  return (
    <FigmaScreen gap={12} mood="calm">
      <BackRow href="/onboarding/weighing" />
      <Title>You decide what Evo keeps</Title>
      <Body>Change these any time. Evo still works with all of them off.</Body>
      {ROWS.map((r) => (
        <RowCard key={r.key} icon={r.icon} tileBg={r.bg} title={r.title} note={r.note}>
          <FigmaToggle on={profile.consents[r.key]} onChange={(v) => update({ consents: { ...profile.consents, [r.key]: v } })} label={r.title} />
        </RowCard>
      ))}
      <Grow />
      <Pill label="Looks good" href="/onboarding/personalise" className="w-full" />
      <button type="button" onClick={() => setPolicy(true)} className="cursor-pointer text-center type-caption text-t3">
        Privacy policy v1.2 · 2-minute read
      </button>
      {policy && (
        <div role="dialog" aria-modal="true" aria-label="Privacy policy" className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 md:items-center" onClick={() => setPolicy(false)}>
          <div className="flex w-full max-w-[393px] flex-col gap-3 rounded-[24px] bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <p className="type-title-m text-t1">Privacy policy v1.2</p>
            <p className="type-body-m text-t2">
              Your chats and journal are encrypted and stored in India. Nothing is shared unless you choose it, item by item. Export or delete everything at
              any time.
            </p>
            <Pill label="Close" variant="glass" icon={null} onClick={() => setPolicy(false)} className="w-full" />
          </div>
        </div>
      )}
    </FigmaScreen>
  );
}
