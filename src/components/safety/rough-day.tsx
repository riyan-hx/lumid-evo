"use client";

import Link from "next/link";
import { useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { safety } from "@/lib/safety";

const TILES = [
  { icon: "chat-lime-18", label: "Talk", href: "/chat/live?mode=listen" },
  { icon: "wind-lime-18", label: "Breathe", href: "/calm/breathe" },
  { icon: "parking-lime-18", label: "Park a worry", href: "/tools/worry" },
];

/** 8.1 · Rough-day Home — Figma node 126:2317. Shown while suggestions are paused. */
export function RoughDay() {
  const [done, setDone] = useState(() => safety.get().roughStepDone === new Date().toDateString());
  return (
    <FigmaScreen gap={14} mood="night" className="pb-[110px]">
      <div className="flex flex-col gap-0.5">
        <p className="type-caption text-lime">Rough-day mode</p>
        <h1 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-white">Let&apos;s keep today tiny.</h1>
      </div>
      <Orb size={110} className="self-center" />
      <div className="flex w-full flex-col gap-2.5 rounded-[28px] border border-white bg-white/12 p-[18px]">
        <p className="type-label-s text-lime">TODAY&apos;S ONLY STEP</p>
        <p className="type-title-l text-white">Drink a glass of water.</p>
        <p className="type-body-s text-lime-soft">{done ? "Done. That counts. Rest is allowed now." : "That's all. Plans are resting until you feel more like yourself."}</p>
        {!done && (
          <Pill
            label="Done"
            variant="lime"
            icon={null}
            className="w-full"
            onClick={() => {
              safety.stepDone();
              setDone(true);
            }}
          />
        )}
      </div>
      <div className="flex w-full gap-2.5">
        {TILES.map((t) => (
          <Link key={t.label} href={t.href} className="flex flex-1 flex-col items-start gap-2 rounded-[20px] border border-white bg-white/12 p-3">
            <span className="flex size-[34px] items-center justify-center rounded-[11px] bg-white/12">
              <FigmaIcon name={t.icon} size={18} />
            </span>
            <span className="text-[14px] leading-[1.3] font-medium whitespace-nowrap text-white">{t.label}</span>
          </Link>
        ))}
      </div>
      <Link href="/crisis" className="flex w-full items-center gap-2.5 rounded-[18px] bg-[rgba(240,138,93,0.2)] p-3">
        <FigmaIcon name="lifebuoy-peachsoft-20" size={20} />
        <span className="type-body-s text-peach-soft">Need someone now? Support is one tap.</span>
      </Link>
    </FigmaScreen>
  );
}
