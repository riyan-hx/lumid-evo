"use client";

import { useRouter } from "next/navigation";
import { BackRow, Body, FigmaIcon, FigmaToggle, GlassCard, RowCard, SectionLabel, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useProfile, type Reminder } from "@/lib/profile";

const LOCALES = ["English", "Malayalam", "Manglish typing"];
const REMINDERS: { v: Reminder; label: string }[] = [
  { v: "after-dinner", label: "After dinner" },
  { v: "before-bed", label: "Before bed" },
  { v: "none", label: "No reminders" },
];

/** 1.8 · Make it yours — Figma node 113:1559 */
export default function Personalise() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const toggleLocale = (l: string) => {
    const next = profile.locales.includes(l) ? profile.locales.filter((x) => x !== l) : [...profile.locales, l];
    update({ locales: next.length ? next : ["English"] });
  };

  async function done() {
    if (profile.reminder !== "none" && "Notification" in window) {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    router.push("/first-day");
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <BackRow href="/privacy" />
      <Title>Make Evo yours</Title>
      <Body>Language, a quiet lock screen, and a lock for shared phones.</Body>
      <SectionLabel>LANGUAGES</SectionLabel>
      <div className="flex w-full gap-2">
        {LOCALES.map((l) => (
          <SoftChip key={l} label={l} selected={profile.locales.includes(l)} onClick={() => toggleLocale(l)} />
        ))}
      </div>
      <GlassCard className="flex-col items-stretch gap-3">
        <div className="flex items-center gap-3">
          <Tile size={36} radius={12} bg="bg-lavender-soft">
            <FigmaIcon name="eyeoff-lav-19" size={19} />
          </Tile>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="type-label-m text-t1">Discreet mode</p>
            <p className="type-caption text-t3">Neutral name on your lock screen</p>
          </div>
          <FigmaToggle on={profile.discreet} onChange={(v) => update({ discreet: v })} label="Discreet mode" />
        </div>
        <div className="flex items-center gap-2.5 rounded-[16px] p-3" style={{ backgroundImage: "linear-gradient(169.567deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
          <Tile size={30} radius={10} bg="bg-lime-soft">
            <FigmaIcon name="calendar-limedeep" size={16} />
          </Tile>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="type-caption text-lime">Planner · now</p>
            <p className="type-label-m text-white">Time for your 2 minutes</p>
          </div>
        </div>
      </GlassCard>
      <RowCard icon="fingerprint-lav" tileBg="bg-lavender-soft" title="App lock" note="Face, fingerprint or PIN">
        <FigmaToggle on={profile.appLock} onChange={(v) => update({ appLock: v })} label="App lock" />
      </RowCard>
      <SectionLabel>GENTLE REMINDER</SectionLabel>
      <div role="radiogroup" aria-label="Gentle reminder" className="flex w-full flex-wrap gap-2">
        {REMINDERS.map((r) => (
          <SoftChip key={r.v} label={r.label} selected={profile.reminder === r.v} onClick={() => update({ reminder: r.v })} />
        ))}
      </div>
      <Grow />
      <Pill label="Done" className="w-full" onClick={done} />
    </FigmaScreen>
  );
}
