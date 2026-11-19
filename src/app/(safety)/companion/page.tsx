"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/cn";

const STEPS = ["Breathe out slowly, longer than you breathe in.", "Name 3 things you can see. Take your time.", "Name 2 things you can feel — your feet, your hands.", "Name 1 thing you can hear. You're here, and this will pass."];
const PILL = ["Breathe out…", "Look around…", "Feel your feet…", "Listen…"];

/** O10 · Lock-screen live companion — Figma node 147:3950. In the web app it runs full screen; the true lock-screen version needs the native app. */
export default function Companion() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <FigmaScreen gap={10} pt={14} mood="latenight">
      <div className="flex w-full justify-center">
        <div className="flex w-[230px] items-center gap-2.5 rounded-full bg-ink px-2.5 py-2">
          <Orb size={22} />
          <p className="flex-1 type-label-m text-white">{PILL[step]}</p>
          <p className="type-label-m text-lime">
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          </p>
        </div>
      </div>
      <p className="w-full text-center type-label-m text-white/80" suppressHydrationWarning>{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      <p className="w-full text-center text-[84px] leading-[1.1] font-medium tracking-[-2.1px] text-white" suppressHydrationWarning>{now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M$/, "")}</p>
      <Grow />
      <div className="flex w-full flex-col gap-3 rounded-[28px] border border-white/20 bg-white/12 p-4 backdrop-blur-[12px]" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <Orb size={32} />
          <div className="flex flex-col gap-px">
            <p className="type-label-m text-white">Evo is with you</p>
            <p className="type-caption text-lime">
              Panic support · step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>
        <p className="type-title-l text-white">{STEPS[step]}</p>
        <div className="flex w-full gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-[3px]", i <= step ? "bg-lime" : "bg-white/20")} />
          ))}
        </div>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => (step < STEPS.length - 1 ? setStep(step + 1) : router.push("/check-in/rerate?tool=ground"))}
            className="flex-1 cursor-pointer rounded-full px-3.5 py-[11px] type-label-m text-forest"
            style={{ backgroundImage: "linear-gradient(165.12deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}
          >
            {step < STEPS.length - 1 ? "Next step" : "Finish"}
          </button>
          <button type="button" onClick={() => router.push("/home")} className="flex-1 cursor-pointer rounded-full border border-white/20 bg-white/12 px-3.5 py-[11px] type-label-m text-white">
            I&apos;m okay now
          </button>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <span className="h-[5px] w-[140px] rounded-[3px] bg-white/90" />
      </div>
    </FigmaScreen>
  );
}
