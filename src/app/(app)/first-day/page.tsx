"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FigmaIcon, GlassCard, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";

const HELPS = [
  { icon: "brain-lav-19", bg: "bg-lavender-soft", title: "Untangle a thought", note: "A guided CBT thought record", href: "/tools" },
  { icon: "wind-sky", bg: "bg-sky-soft", title: "Calm your body", note: "Breathing and grounding, 1–3 min", href: "/calm" },
  { icon: "path-limedeep-19", bg: "bg-lime-soft", title: "Take one small step", note: "When everything feels too big", href: "/ladder" },
];

/** 1.9 · First day — Figma node 113:1647 */
export default function FirstDay() {
  const { profile, update } = useProfile();
  useEffect(() => {
    if (!profile.onboarded) update({ onboarded: true });
  }, [profile.onboarded, update]);
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" }).format(new Date());

  return (
    <FigmaScreen gap={14} className="pb-[110px]">
      <div className="flex w-full flex-col gap-0.5">
        <p className="type-caption text-t3">{today.replace(" ", ", ")}</p>
        <h1 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-forest">Hi{profile.name ? ` ${profile.name}` : ""}, glad you&apos;re here</h1>
      </div>
      <div
        className="flex w-full flex-col gap-3 rounded-[28px] border border-white p-[18px] shadow-[0_18px_40px_-12px_rgba(21,26,19,0.18)]"
        style={{ backgroundImage: "linear-gradient(147.95deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
      >
        <div className="flex items-center gap-2.5">
          <Orb size={40} />
          <div className="flex flex-col">
            <p className="type-label-m text-t1">Evo</p>
            <p className="type-caption text-t3">Your first check-in</p>
          </div>
        </div>
        <p className="text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-forest">Let&apos;s start with how you&apos;re feeling. Ten seconds, no typing.</p>
        <Pill label="Check in now" variant="lime" href="/check-in" className="w-full" />
      </div>
      <h2 className="type-title-m text-ink">What Evo can help with</h2>
      {HELPS.map((h) => (
        <Link key={h.title} href={h.href} className="w-full">
          <GlassCard className="rounded-[18px] p-3">
            <Tile size={36} radius={12} bg={h.bg}>
              <FigmaIcon name={h.icon} size={19} />
            </Tile>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="type-label-m text-t1">{h.title}</p>
              <p className="type-caption text-t3">{h.note}</p>
            </div>
            <FigmaIcon name="chevron-right" size={18} />
          </GlassCard>
        </Link>
      ))}
    </FigmaScreen>
  );
}
