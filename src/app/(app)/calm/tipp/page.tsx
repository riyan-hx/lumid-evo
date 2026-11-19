"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";

const SKILLS = [
  { letter: "T", title: "Temperature", note: "Cold water on your face, or hold something cold, for 30 seconds", secs: 30, doing: "Cold water on your face, or something cold in your hands." },
  { letter: "I", title: "Intense movement", note: "Jumping jacks or a fast walk, 1–2 minutes", secs: 90, doing: "Jumping jacks, stairs or a fast walk. Get your heart going." },
  { letter: "P", title: "Paced breathing", note: "Breathe out longer than you breathe in", secs: 60, doing: "In for 4… out for 6. Let the out-breath be longer." },
  { letter: "P", title: "Paired relaxation", note: "Tense, then release, as you breathe out", secs: 60, doing: "Breathe in and tense your body. Breathe out and let it all go." },
];
const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s} seconds`);

/** 6.5 · TIPP — it's too much — Figma node 123:2372 */
export default function Tipp() {
  const router = useRouter();
  const [pick, setPick] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const s = SKILLS[pick];

  useEffect(() => {
    if (left === null) return;
    if (left === 0) {
      haptic("success");
      router.push("/check-in/rerate?tool=tipp");
      return;
    }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, router]);

  if (left !== null)
    return (
      <FigmaScreen gap={14} mood="warm">
        <FlowHeader icon="close" label="Stop" title="When it's too much" sub={`DBT · ${s.title}`} onClick={() => setLeft(null)} />
        <Grow />
        <div className="flex w-full justify-center">
          <Orb size={150} state="breathing" />
        </div>
        <p className="text-center type-screen-title text-forest tabular-nums" aria-live="polite">
          {left >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : left}
        </p>
        <p className="text-center type-body-m text-t2">{s.doing}</p>
        <Grow />
        <Pill label="I feel a bit steadier" className="w-full" onClick={() => router.push("/check-in/rerate?tool=tipp")} />
      </FigmaScreen>
    );

  return (
    <FigmaScreen gap={12} mood="warm">
      <FlowHeader icon="close" label="Close" title="When it's too much" sub="DBT · TIPP" onClick={() => router.push("/calm")} />
      <h1 className="type-flow-title text-forest">Let&apos;s bring the intensity down fast.</h1>
      <p className="type-body-m text-t2">Four ways to change your body chemistry. Any one helps.</p>
      <div role="radiogroup" aria-label="Pick one" className="flex w-full flex-col gap-3">
        {SKILLS.map((k, i) => {
          const on = pick === i;
          return (
            <button key={k.title} type="button" role="radio" aria-checked={on} onClick={() => setPick(i)} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[18px] p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78")}>
              <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[12px] type-title-m text-lime" style={{ backgroundImage: "linear-gradient(135deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
                {k.letter}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{k.title}</span>
                <span className="type-caption text-t3">{k.note}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Grow />
      <Link href="/crisis" className="flex w-full items-center gap-2.5 rounded-[16px] bg-peach-soft p-3">
        <FigmaIcon name="lifebuoy-peach" size={20} />
        <span className="flex-1 type-label-m text-peach-text">If you might hurt yourself, get support now</span>
        <FigmaIcon name="chevron-right-peach-16" size={16} />
      </Link>
      <Pill label={`Start · ${fmt(s.secs)}`} className="w-full" onClick={() => setLeft(s.secs)} />
    </FigmaScreen>
  );
}
