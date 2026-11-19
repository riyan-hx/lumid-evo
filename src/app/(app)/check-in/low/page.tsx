"use client";

import Link from "next/link";
import { FigmaIcon, GlassCard, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { ENERGY } from "@/lib/feelings";

const WAYS = [
  { icon: "leaf-mint-19", bg: "bg-mint-soft", title: "Ground with 5-4-3-2-1", note: "2 min · eyes open", href: "/calm" },
  { icon: "users-lav-19", bg: "bg-lavender-soft", title: "Message someone you trust", note: "A ready message, you send it", href: "/safety/reach-out" },
  { icon: "chat-sky-19", bg: "bg-sky-soft", title: "Keep talking to Evo", note: "I'm here, no rush", href: "/chat?mode=listen" },
];

/**
 * C13 · When a check-in is very low — Figma node 136:3199. SAFETY: copy and thresholds need clinician sign-off.
 * Never dismissible by accident; crisis line always visible.
 */
export default function VeryLow() {
  const { items } = useCheckIns();
  const last = items[0];
  const label = last ? `${last.word ? last.word[0].toUpperCase() + last.word.slice(1) : last.feeling} · ${last.intensity}` : "Very low";
  const energy = last?.energy !== undefined ? ENERGY[Math.min(4, Math.max(0, last.energy))].toLowerCase() : null;

  return (
    <FigmaScreen gap={14} mood="warm">
      <div className="flex w-full flex-col gap-px">
        <p className="type-label-m text-t1">Check-in</p>
        <p className="type-caption text-t3">Saved</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2.5 rounded-[18px] border border-white bg-surface p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
        <span className="rounded-full bg-sky-soft px-2.5 py-1.5 type-label-s text-sky-text">{label}</span>
        {energy && <span className="rounded-full bg-lavender-soft px-2.5 py-1.5 type-label-s text-lavender-text">Energy: {energy}</span>}
      </div>
      <div role="alert" className="flex w-full flex-col gap-3 rounded-[28px] border border-peach-soft bg-peach-subtle p-[18px] shadow-[0_18px_34px_-12px_rgba(21,26,19,0.12)]">
        <div className="flex items-center gap-2.5">
          <Orb size={32} />
          <p className="type-label-m text-peach-text">Evo</p>
        </div>
        <p className="text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-forest">That&apos;s a really heavy place to be. Can I check — are you safe right now?</p>
        <Pill label="I'm not sure" icon={null} href="/safety" className="w-full" />
        <Pill label="I'm safe, just very low" variant="glass" icon={null} href="/home" className="w-full" />
      </div>
      <a href="tel:14416" className="w-full">
        <GlassCard className="rounded-[18px] bg-surface p-3">
          <Tile size={36} radius={12} bg="bg-peach-soft">
            <FigmaIcon name="phone-peach-19" size={19} />
          </Tile>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="type-label-m text-t1">Tele-MANAS 14416</p>
            <p className="type-caption text-t3">Free · 24×7 · Malayalam</p>
          </div>
          <FigmaIcon name="chevron-right" size={18} />
        </GlassCard>
      </a>
      <p className="type-label-s text-t3">OTHER WAYS THROUGH THIS MOMENT</p>
      {WAYS.map((w) => (
        <Link key={w.title} href={w.href} className="w-full">
          <GlassCard className="rounded-[18px] bg-surface p-3">
            <Tile size={36} radius={12} bg={w.bg}>
              <FigmaIcon name={w.icon} size={19} />
            </Tile>
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="type-label-m text-t1">{w.title}</p>
              <p className="type-caption text-t3">{w.note}</p>
            </div>
            <FigmaIcon name="chevron-right" size={18} />
          </GlassCard>
        </Link>
      ))}
      <Grow />
      <p className="text-center type-caption text-peach-text">Very low check-ins never get a &ldquo;great job&rdquo; screen — they get a person-first response.</p>
    </FigmaScreen>
  );
}
