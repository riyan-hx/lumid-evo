"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { hardLabel, loadLadder, saveLadder } from "@/lib/ladder";

/** 7.4 · How hard will it be? — Figma node 125:2409. Hold the orb: the number climbs; let go to set it. */
export default function Rate() {
  const router = useRouter();
  const [n, setN] = useState(1);
  const [holding, setHolding] = useState(false);
  const [set, setSet] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!loadLadder()) router.replace("/ladder/build");
    return () => clearInterval(timer.current);
  }, [router]);

  function hold() {
    setHolding(true);
    setSet(true);
    setN(1);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setN((x) => {
        const next = Math.min(10, x + 1);
        if ("vibrate" in navigator) navigator.vibrate(8 + next * 6);
        return next;
      });
    }, 450);
  }
  function release() {
    setHolding(false);
    clearInterval(timer.current);
  }

  return (
    <FigmaScreen gap={14} mood="warm">
      <FlowHeader icon="close" label="Close" title="Before you start" sub="" onClick={() => router.push("/ladder")} />
      <h1 className="text-center type-flow-title text-forest">How hard will this feel?</h1>
      <p className="text-center type-body-m text-t2">Hold the orb, let go when it feels right.</p>
      <div className="flex h-[250px] w-full items-center justify-center">
        <button
          type="button"
          aria-label="Hold to rate how hard it will feel"
          onPointerDown={hold}
          onPointerUp={release}
          onPointerLeave={release}
          onKeyDown={(e) => {
            const step = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
            if (!step) return;
            setN(Math.min(10, Math.max(1, n + step)));
            setSet(true);
          }}
          className="flex size-60 cursor-pointer touch-none items-center justify-center rounded-[120px] border-[3px] border-dotted border-peach-text bg-white/35 select-none"
          style={{ transform: `scale(${holding ? 0.97 : 1})`, transition: "transform 200ms" }}
        >
          <Orb size={180} state={holding ? "breathing" : "idle"} />
        </button>
      </div>
      <p className="text-center text-[64px] leading-none font-medium tracking-[-1.6px] text-forest tabular-nums" aria-live="polite">
        {set ? n : "–"}
      </p>
      <p className={cn("text-center type-label-m", n >= 7 ? "text-peach-text" : "text-lime-deep")}>{set ? hardLabel(n) : "Hold to start"}</p>
      <div className="flex items-center justify-center gap-2">
        <FigmaIcon name="hand-peach-18" size={18} />
        <p className="type-body-s text-peach-text">{holding ? "Holding… haptics grow stronger" : "Press and hold · arrow keys work too"}</p>
      </div>
      <Grow />
      <Pill
        label="Start"
        className="w-full"
        disabled={!set || holding}
        onClick={() => {
          const l = loadLadder();
          if (l) saveLadder({ ...l, expected: n });
          router.push("/ladder/do");
        }}
      />
    </FigmaScreen>
  );
}
