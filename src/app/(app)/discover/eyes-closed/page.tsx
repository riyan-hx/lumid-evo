"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OHeader } from "@/components/discover/parts";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { cn } from "@/lib/cn";

/** One breath: 4 short taps in (4 s), one long buzz out (6 s). */
const IN = 4000;
const OUT = 6000;
const TAPS = [0, 1000, 2000, 3000].flatMap((t) => [80, t === 3000 ? 0 : 920]).filter(Boolean);
const BTN = "flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white/20 bg-white/12 backdrop-blur-[12px]";

/** O7 · Eyes-closed calm (haptics) — Figma node 147:3707. Follow the buzz; the screen dims after 3 s. */
export default function EyesClosed() {
  const router = useRouter();
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [paused, setPaused] = useState(false);
  const [dim, setDim] = useState(false);
  const [canBuzz, setCanBuzz] = useState(true);
  useEffect(() => setCanBuzz("vibrate" in navigator), []); // eslint-disable-line react-hooks/set-state-in-effect -- feature check after mount
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (paused) return void navigator.vibrate?.(0);
    const run = (p: "in" | "out") => {
      setPhase(p);
      navigator.vibrate?.(p === "in" ? TAPS : [OUT - 400]);
      t.current = setTimeout(() => run(p === "in" ? "out" : "in"), p === "in" ? IN : OUT);
    };
    run("in");
    const d = setTimeout(() => setDim(true), 3000);
    return () => {
      clearTimeout(t.current);
      clearTimeout(d);
      navigator.vibrate?.(0);
    };
  }, [paused]);

  const wake = () => setDim(false);
  const dots = phase === "in" ? 4 : 5;
  return (
    <FigmaScreen gap={16} mood="latenight">
      <OHeader icon="close" label="Close" title="Eyes-closed calm" sub={canBuzz ? "Screen dims in 3 s · follow the buzz" : "This phone can't buzz from the web · follow the circle"} onClick={() => router.back()} dark />
      <Grow />
      <div className="flex w-full justify-center">
        <div className="flex size-[250px] items-center justify-center rounded-full border border-[rgba(136,217,95,0.25)] bg-[rgba(136,217,95,0.08)]">
          <div className={cn("flex size-[180px] items-center justify-center rounded-full bg-[rgba(136,217,95,0.14)] transition-transform ease-in-out", phase === "in" ? "scale-110 duration-[4000ms]" : "scale-90 duration-[6000ms]")}>
            <div className="flex size-[110px] items-center justify-center rounded-full shadow-[0_0_40px_rgba(21,26,19,0.3)]" style={{ backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}>
              <FigmaIcon name="wave-forest-30" size={30} />
            </div>
          </div>
        </div>
      </div>
      <p className="text-center type-title-l text-white" aria-live="polite">
        {phase === "out" ? "Long buzz — breathe out" : "Short taps — breathe in"}
      </p>
      <p className="text-center type-body-m text-white/70">{phase === "out" ? "Short taps — breathe in" : "Long buzz — breathe out"}</p>
      <div className="flex w-full items-center justify-center gap-1.5" aria-hidden>
        {[0, 1].map((b) => (
          <span key={b} className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("size-2.5 rounded-[5px]", phase === "in" && b === 0 && i < dots ? "bg-lime" : "bg-[rgba(136,217,95,0.5)]")} />
            ))}
            <span className={cn("h-2.5 w-[60px] rounded-[5px]", phase === "out" || b === 1 ? "bg-lime" : "bg-[rgba(136,217,95,0.5)]")} />
          </span>
        ))}
      </div>
      <div className="flex w-full items-center gap-3 rounded-[20px] border border-white/18 bg-white/10 p-3.5 backdrop-blur-[12px]">
        <Tile size={36} radius={12} bg="bg-white/12">
          <FigmaIcon name="phone-lime-19" size={19} />
        </Tile>
        <div className="flex flex-col gap-0.5">
          <p className="type-label-m text-white">Rest the phone on your chest</p>
          <p className="type-caption text-lime">Works in the dark, in public, in bed</p>
        </div>
      </div>
      <Grow />
      <div className="flex w-full justify-center gap-3">
        <button type="button" aria-label={paused ? "Resume" : "Pause"} aria-pressed={paused} onClick={() => setPaused((p) => !p)} className={BTN}>
          <FigmaIcon name="pause-white-20" size={20} />
        </button>
        <button type="button" aria-label="Stop" onClick={() => router.back()} className={BTN}>
          <FigmaIcon name="close-white" size={20} />
        </button>
      </div>
      {dim && <button type="button" aria-label="Screen dimmed — tap to wake" onClick={wake} className="fixed inset-0 z-50 cursor-pointer bg-black/90" />}
    </FigmaScreen>
  );
}
