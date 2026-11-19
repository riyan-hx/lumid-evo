"use client";

import { useRouter } from "next/navigation";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Card } from "@/components/ui/card";
import { SoftChip, Toggle } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useProfile, type Reminder } from "@/lib/profile";

const LOCALES = ["English", "Malayalam", "Manglish typing"];
const REMINDERS: { v: Reminder; label: string }[] = [
  { v: "after-dinner", label: "After dinner" },
  { v: "before-bed", label: "Before bed" },
  { v: "none", label: "No reminders" },
];

/** 1.8 · Make it yours */
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
    <div>
      <StepHeader step={4} back="/privacy" />
      <Heading title="Make Evo yours" />
      <p className="mb-2 type-label-s text-t3">LANGUAGES</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <SoftChip key={l} label={l} selected={profile.locales.includes(l)} onClick={() => toggleLocale(l)} />
        ))}
      </div>
      <Card className="mb-6 gap-0 p-0">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1">
            <p className="type-label-m">Discreet mode</p>
            <p className="type-body-s text-t3">Neutral name on your tabs and notifications</p>
          </div>
          <Toggle on={profile.discreet} onChange={(v) => update({ discreet: v })} label="Discreet mode" />
        </div>
        {profile.discreet && (
          <div className="mx-4 mb-4 rounded-[14px] bg-subtle p-3">
            <p className="type-label-s">Planner · now</p>
            <p className="type-body-s text-t2">Time for your 2 minutes</p>
          </div>
        )}
        <div className="flex items-center gap-3 border-t border-line p-4">
          <div className="flex-1">
            <p className="type-label-m">App lock</p>
            <p className="type-body-s text-t3">Passkey or PIN · coming soon on web</p>
          </div>
          <Toggle on={profile.appLock} onChange={(v) => update({ appLock: v })} label="App lock" />
        </div>
      </Card>
      <p className="mb-2 type-label-s text-t3">GENTLE REMINDER</p>
      <div role="radiogroup" aria-label="Reminder" className="flex flex-wrap gap-2">
        {REMINDERS.map((r) => (
          <SoftChip key={r.v} label={r.label} selected={profile.reminder === r.v} onClick={() => update({ reminder: r.v })} />
        ))}
      </div>
      <Pill label="Done" className="mt-8 w-full" onClick={done} />
    </div>
  );
}
