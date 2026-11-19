"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { type Ladder, loadLadder } from "@/lib/ladder";

/** 7.5 · Quiet company — Figma node 125:2463. A silent two-minute timer while the step happens. */
export default function QuietCompany() {
  const router = useRouter();
  const [l, setL] = useState<Ladder | null>(null);
  const [left, setLeft] = useState(120);

  useEffect(() => {
    const saved = loadLadder();
    if (!saved) return router.replace("/ladder/build");
    setL(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, [router]);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (!l) return <FigmaScreen mood="night">{null}</FigmaScreen>;
  const rung = l.rungs[l.current];
  return (
    <FigmaScreen gap={14} mood="night">
      <div className="flex w-full items-center gap-2.5">
        <button type="button" aria-label="Close" onClick={() => router.push("/ladder")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/12 backdrop-blur-[12px]">
          <FigmaIcon name="close-white" size={20} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="type-label-m text-white">With Evo</p>
          <p className="truncate type-caption text-lime">{rung.text}</p>
        </div>
      </div>
      <Grow />
      <div className="flex w-full justify-center">
        <div className="flex size-[270px] items-center justify-center rounded-[135px] border border-lime bg-lime/14">
          <div className="relative flex size-[220px] items-center justify-center">
            {/* Four arcs, as in the design; they turn slowly while the timer runs. */}
            <svg aria-hidden width={220} height={220} viewBox="0 0 220 220" className="absolute inset-0" style={{ animation: left > 0 ? "evo-spin 24s linear infinite" : undefined }}>
              <circle cx={110} cy={110} r={107} fill="none" stroke="#88D95F" strokeWidth={6} strokeLinecap="round" strokeDasharray="60 108.1" strokeDashoffset={30} />
            </svg>
            <Orb size={140} state="breathing" />
          </div>
        </div>
      </div>
      <p className="text-center text-[64px] leading-none font-medium tracking-[-1.6px] text-white tabular-nums" aria-live="off">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      </p>
      <p className="text-center type-body-m text-lime-soft">{left > 0 ? "Evo is here with you. No need to talk." : "Time's up — but there's no rush."}</p>
      {l.song && (
        <div className="flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-2">
            <FigmaIcon name="music-lime-16" size={16} />
            <span className="type-label-s text-white">Put your song on</span>
          </span>
        </div>
      )}
      <Grow />
      <div className="flex w-full gap-2.5">
        <Pill label="Done" variant="lime" icon={null} className="flex-1" onClick={() => router.push("/ladder/done")} />
        <Pill label="+2 min" variant="glass" icon={null} onClick={() => setLeft(left + 120)} />
      </div>
    </FigmaScreen>
  );
}
