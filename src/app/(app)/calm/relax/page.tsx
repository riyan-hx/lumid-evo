"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";

type Region = "head" | "shoulders" | "torso";
const STEPS: { part: string; region: Region; tense: string }[] = [
  { part: "Hands", region: "shoulders", tense: "Make tight fists with both hands…" },
  { part: "Arms", region: "shoulders", tense: "Bend your arms and tense your biceps…" },
  { part: "Shoulders", region: "shoulders", tense: "Squeeze your shoulders up to your ears…" },
  { part: "Face", region: "head", tense: "Scrunch your whole face, eyes shut tight…" },
  { part: "Stomach", region: "torso", tense: "Pull your stomach in and hold it firm…" },
  { part: "Legs", region: "torso", tense: "Press your knees together and tense your thighs…" },
  { part: "Feet", region: "torso", tense: "Curl your toes down, hard…" },
];
const LABEL_AT: Record<Region, { left: number; top: number }> = { head: { left: 210, top: 30 }, shoulders: { left: 232, top: 56 }, torso: { left: 236, top: 150 } };
const HOT = "border-2 border-peach-text bg-peach-soft";

/** 6.4 · Let go of tension — Figma node 123:2317 */
export default function Relax() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<"tense" | "release">("tense");
  const s = STEPS[i];

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, i, phase]);

  function next() {
    haptic("light");
    if (phase === "tense") {
      setPhase("release");
      setCount(5);
      return;
    }
    if (i === STEPS.length - 1) return router.push("/check-in/rerate?tool=relax");
    setI(i + 1);
    setPhase("tense");
    setCount(5);
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="close" label="Close" title="Muscle relaxation" sub={`Step ${i + 1} of ${STEPS.length} · ${s.part.toLowerCase()}`} onClick={() => router.push("/calm")} />
      <div className="relative mx-auto h-[250px] w-full max-w-[345px] overflow-hidden rounded-[28px] bg-white/60" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma head shape */}
        <img src="/figma/body/head.svg" alt="" width={56} height={64} className="absolute top-[18px] left-[145px]" />
        {s.region === "head" && <span className={cn("absolute top-[18px] left-[145px] h-16 w-14 rounded-[50%]", HOT)} />}
        <span className={cn("absolute top-[88px] left-[78px] h-10 w-[190px] rounded-[20px]", s.region === "shoulders" ? HOT : "bg-lavender-soft")} />
        <span className={cn("absolute top-[122px] left-[115px] h-[120px] w-[116px] rounded-[44px]", s.region === "torso" ? HOT : "bg-lavender-soft")} />
        <span className="absolute rounded-full px-2.5 py-1.5 type-caption text-white" style={{ ...LABEL_AT[s.region], backgroundImage: "var(--gradient-forest)" }}>
          {s.part}
        </span>
      </div>
      <h1 className="type-flow-title text-forest" aria-live="polite">
        {phase === "tense" ? s.tense : "And let go. Notice the difference."}
      </h1>
      <p className="type-body-m text-t2">{phase === "tense" ? "Hold for 5. Then let them drop, and notice the difference." : "Let the muscles go soft. Breathe out slowly."}</p>
      <div className="flex w-full justify-center gap-2" aria-label={`${count} seconds`}>
        {[5, 4, 3, 2, 1].map((n) => {
          const now = n === count;
          const past = n > count;
          return (
            <span key={n} className={cn("flex size-11 items-center justify-center rounded-[22px] type-title-m", now ? "text-forest" : past ? "bg-lime-soft text-t2" : "bg-surface text-t2")} style={now ? { backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}>
              {n}
            </span>
          );
        })}
      </div>
      <Grow />
      <Pill label={phase === "tense" ? "Release" : i === STEPS.length - 1 ? "Finish" : "Next muscle"} className="w-full" onClick={next} />
    </FigmaScreen>
  );
}
