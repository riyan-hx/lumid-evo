"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { type Ladder, loadLadder, saveLadder } from "@/lib/ladder";

const WORDS = ["", "a day", "two days", "three days", "four days", "five days", "six days", "a week"];

/** Expected vs actual bar (tap or drag "It was" to set it). */
function Bar({ label, value, tone, onChange }: { label: string; value: number; tone: "peach" | "lime"; onChange?: (n: number) => void }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <p className="w-[90px] shrink-0 type-body-s text-t2">{label}</p>
      <div className="relative h-[26px] flex-1 overflow-hidden rounded-[10px] bg-subtle">
        <div className={`h-[26px] rounded-[10px] ${tone === "peach" ? "bg-peach-soft" : ""}`} style={{ width: `${value * 10}%`, backgroundImage: tone === "lime" ? "linear-gradient(155.48deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" : undefined }} />
        {onChange && <input type="range" min={1} max={10} value={value} aria-label="How hard it really was" onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 cursor-pointer opacity-0" />}
      </div>
      <p className="w-6 shrink-0 text-right type-title-l text-t1">{value}</p>
    </div>
  );
}

/** 7.6 · How hard was it, really? — Figma node 125:2527 */
export default function HowHard() {
  const router = useRouter();
  const toast = useToast();
  const [now] = useState(() => Date.now());
  const [l, setL] = useState<Ladder | null>(null);
  const [actual, setActual] = useState(3);

  useEffect(() => {
    const saved = loadLadder();
    if (!saved) return router.replace("/ladder/build");
    setL(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setActual(Math.max(1, (saved.expected ?? 5) - 3));
  }, [router]);

  if (!l) return <FigmaScreen>{null}</FigmaScreen>;
  const expected = l.expected ?? 5;
  const rung = l.rungs[l.current];
  const days = l.plannedAt ? Math.floor((now - new Date(l.plannedAt).getTime()) / 864e5) : 0;
  const verdict = actual < expected ? "Much easier than you thought. That's your brain learning the step is safe." : actual === expected ? "About as hard as you expected — and you still did it." : "Harder than you thought, and you did it anyway. That counts double.";
  const praise = /chat|message|hey|call|tell|say|send/i.test(rung.text) ? `You reached out${days > 0 ? ` after ${WORDS[Math.min(days, 7)]}` : ""}. That took courage.` : "You started. That's the hardest part, and it's done.";

  function save(): Ladder {
    const next: Ladder = { ...l!, history: [{ text: rung.text, expected, actual, at: new Date().toISOString() }, ...l!.history], expected: undefined };
    saveLadder(next);
    return next;
  }

  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={() => router.push("/home")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <div className="flex w-full justify-center">
        <Orb size={100} />
      </div>
      <h1 className="text-center type-flow-title text-forest">You did it.</h1>
      <p className="text-center type-body-m text-t2">How hard was it, really?</p>
      <div className="flex w-full flex-col gap-3 rounded-[22px] border border-white bg-white/78 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <Bar label="You expected" value={expected} tone="peach" />
        <Bar label="It was" value={actual} tone="lime" onChange={setActual} />
        <p className="type-body-s text-lime-deep" aria-live="polite">
          {verdict}
        </p>
      </div>
      <div className="flex w-full items-center gap-3 rounded-[22px] border border-white p-3.5" style={{ backgroundImage: "linear-gradient(168.85deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[13px] bg-surface">
          <FigmaIcon name="star-limedeep-20" size={20} />
        </span>
        <p className="flex-1 type-label-m text-forest">{praise}</p>
      </div>
      <Grow />
      {l.current > 0 && (
        <Pill
          label="One more rung?"
          className="w-full"
          onClick={() => {
            const next = save();
            saveLadder({ ...next, current: next.current - 1 });
            router.push("/ladder/rate");
          }}
        />
      )}
      <button
        type="button"
        onClick={() => {
          save();
          toast.show("Saved. Next time starts from here.");
          router.push("/home");
        }}
        className="cursor-pointer text-center type-label-m text-t2"
      >
        That&apos;s enough for today
      </button>
    </FigmaScreen>
  );
}
