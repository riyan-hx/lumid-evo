"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";

/** Cyclic sighing: two inhales through the nose, one long exhale. Seconds per phase. */
const PHASES = [
  { key: "in1", ms: 2000, title: "Breathe in…", scale: 0.86 },
  { key: "in2", ms: 1200, title: "Breathe in… and a little more", scale: 1 },
  { key: "out", ms: 6000, title: "Now breathe out, long and slow", scale: 0.72 },
] as const;
const ROUNDS = 5;
const CHIP = "rounded-full px-3.5 py-2 type-label-s";

/** Soft brown noise, made on the device (no download). */
function useNoise() {
  const ctx = useRef<AudioContext | null>(null);
  const [on, setOn] = useState(false);
  function toggle() {
    if (on) {
      ctx.current?.close();
      ctx.current = null;
      return setOn(false);
    }
    const ac = new AudioContext();
    const buf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ac.createGain();
    gain.gain.value = 0.25;
    src.connect(gain).connect(ac.destination);
    src.start();
    ctx.current = ac;
    setOn(true);
  }
  useEffect(() => () => void ctx.current?.close(), []);
  return { on, toggle };
}

/** 6.2 · Breathe — Figma node 123:2173 */
function Breathe() {
  const router = useRouter();
  const bed = useSearchParams().get("bed");
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const noise = useNoise();
  const done = round > ROUNDS;

  useEffect(() => {
    if (paused || done) return;
    const t = setTimeout(() => {
      haptic(phase === 1 ? "light" : "selection");
      if (phase < 2) setPhase(phase + 1);
      else {
        setPhase(0);
        setRound((r) => r + 1);
      }
    }, PHASES[phase].ms);
    return () => clearTimeout(t);
  }, [phase, paused, done]);

  const next = bed ? "/calm/wind-down" : "/check-in/rerate?tool=breathe";
  const finish = () => router.push(next);
  useEffect(() => {
    if (done) router.push(next);
  }, [done, next, router]);

  const p = PHASES[phase];
  return (
    <FigmaScreen gap={14} mood="night">
      <div className="flex w-full items-center gap-2.5">
        <button type="button" aria-label="Close" onClick={() => router.push("/calm")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/12 backdrop-blur-[12px]">
          <FigmaIcon name="close-white" size={20} />
        </button>
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-white">Calm space</p>
          <p className="type-caption text-lime">
            Round {Math.min(round, ROUNDS)} of {ROUNDS}
          </p>
        </div>
      </div>
      <p className="text-center type-body-m text-lime-soft">Let&apos;s slow things down together.</p>
      <Grow />
      <div className="flex h-[300px] w-full items-center justify-center">
        <div className="flex size-[280px] items-center justify-center rounded-[140px] bg-lime/14">
          <div className="flex size-[220px] items-center justify-center rounded-[110px] border border-lime bg-lime/14 transition-transform ease-in-out" style={{ transform: `scale(${paused ? 1 : p.scale})`, transitionDuration: `${p.ms}ms` }}>
            <Orb size={170} state="still" />
          </div>
        </div>
      </div>
      <h1 className="text-center text-[30px] leading-[1.1] font-medium tracking-[-0.75px] text-white" aria-live="polite">
        {paused ? "Paused" : p.title}
      </h1>
      <p className="text-center type-body-m text-lime-soft">Two short breaths in through the nose, one long breath out.</p>
      <div className="flex w-full justify-center gap-2" aria-hidden>
        {PHASES.map((x, i) => (
          <span key={x.key} className={cn(CHIP, i <= phase ? "text-forest" : "bg-white/12 text-lime-soft")} style={i <= phase ? { backgroundImage: "linear-gradient(139.9deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}>
            {i === 2 ? "Out, long" : "In"}
          </span>
        ))}
      </div>
      <Grow />
      <div className="flex w-full items-center justify-center gap-6">
        <button type="button" aria-label={noise.on ? "Stop calm sound" : "Play calm sound"} aria-pressed={noise.on} onClick={noise.toggle} className={cn("flex size-12 cursor-pointer items-center justify-center rounded-[16px]", noise.on ? "bg-lime/30" : "bg-white/12")}>
          <FigmaIcon name="music-white-25" size={25} />
        </button>
        <button type="button" aria-label={paused ? "Resume" : "Pause"} onClick={() => setPaused(!paused)} className="flex size-[72px] cursor-pointer items-center justify-center rounded-[36px] shadow-[0_12px_24px_rgba(21,26,19,0.3)]" style={{ backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}>
          {paused ? <span className="ml-1 size-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-forest" /> : <FigmaIcon name="pause-forest-28" size={28} />}
        </button>
        <button type="button" aria-label="I'm done" onClick={finish} className="flex size-12 cursor-pointer items-center justify-center rounded-[16px] bg-white/12">
          <FigmaIcon name="check-white-25" size={25} />
        </button>
      </div>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Breathe />
    </Suspense>
  );
}
