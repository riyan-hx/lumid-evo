"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { safety } from "@/lib/safety";

const ROWS = [
  { icon: "sun-sun-21", bg: "bg-sun-soft", text: "A bit better", href: "/home" },
  { icon: "rain-sky-21", bg: "bg-sky-soft", text: "Still hard", href: "/chat/live?mode=listen" },
  { icon: "compass-lav-21", bg: "bg-lavender-soft", text: "Just looking around", href: "/home" },
];

/** 8.8 · Gentle return — Figma node 127:2655. Shown once after a safety pause ends. */
export default function GentleReturn() {
  useEffect(() => safety.markReturned(), []);
  return (
    <FigmaScreen gap={14}>
      <div className="h-[172px] w-full" />
      <Orb size={130} className="self-center" />
      <h1 className="mt-2 text-center type-flow-title text-forest">Glad you&apos;re back.</h1>
      <p className="text-center type-body-m text-t2">No plans, no catching up. How are you today?</p>
      {ROWS.map((r) => (
        <Link key={r.text} href={r.href} className="flex w-full items-center gap-3 rounded-[20px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-[13px] ${r.bg}`}>
            <FigmaIcon name={r.icon} size={21} />
          </span>
          <span className="flex-1 text-[17px] leading-[1.3] font-medium text-t1">{r.text}</span>
          <FigmaIcon name="chevron-right" size={18} />
        </Link>
      ))}
      <Grow />
      <Link href="/crisis" className="flex w-full items-center gap-2.5 rounded-[18px] bg-peach-soft p-3">
        <FigmaIcon name="lifebuoy-peach" size={20} />
        <span className="type-body-s text-peach-text">Support is still one tap away, any time.</span>
      </Link>
    </FigmaScreen>
  );
}
