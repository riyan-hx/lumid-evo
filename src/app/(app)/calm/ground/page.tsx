"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";

const SENSES = [
  { n: 5, verb: "see", ideas: ["A light", "My hands", "A door", "Something blue", "The ceiling", "A window", "My phone"] },
  { n: 4, verb: "feel", ideas: ["My feet on the floor", "The chair behind me", "Cool air", "My hands", "Clothes on my skin", "The phone in my hand"] },
  { n: 3, verb: "hear", ideas: ["A fan", "Traffic", "My breathing", "Birds", "Voices far away", "A clock"] },
  { n: 2, verb: "smell", ideas: ["Soap on my hands", "Food", "Fresh air", "Coffee or chai", "My clothes"] },
  { n: 1, verb: "taste", ideas: ["Toothpaste", "Water", "Tea", "Nothing much — that counts"] },
];
const ENCOURAGE = ["Take your time — slow is the point.", "Nice. Keep noticing.", "You're doing it.", "Almost there for this sense."];

/** 6.3 · 5-4-3-2-1 grounding — Figma node 123:2240 */
export default function Grounding() {
  const router = useRouter();
  const [sense, setSense] = useState(0);
  const [picked, setPicked] = useState<string[][]>(SENSES.map(() => []));
  const s = SENSES[sense];
  const mine = picked[sense];
  const enough = mine.length >= s.n;
  const toggle = (v: string) => setPicked(picked.map((p, i) => (i !== sense ? p : p.includes(v) ? p.filter((x) => x !== v) : [...p, v])));

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="close" label="Close" title="Grounding" sub="Come back to the room" onClick={() => router.push("/calm")} />
      <h1 className="type-flow-title text-forest">
        Name {s.n} {s.n === 1 ? "thing" : "things"} you can {s.verb}.
      </h1>
      <p className="type-body-m text-t2">Tap each one as you notice it — no need to type.</p>
      <ol className="flex w-full gap-2" aria-label="Senses">
        {SENSES.map((x, i) => {
          const state = i < sense ? "done" : i === sense ? "now" : "next";
          return (
            <li
              key={x.verb}
              aria-current={state === "now" ? "step" : undefined}
              className={cn("flex flex-1 flex-col items-center gap-1 self-stretch rounded-[16px] p-2", state === "now" && "border-[1.5px] border-lime bg-lime-soft", state === "next" && "bg-surface", state === "done" && "text-forest")}
              style={state === "done" ? { backgroundImage: "linear-gradient(133.65deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}
            >
              <span className={cn("type-title-l", state !== "done" && "text-t1")}>{x.n}</span>
              <span className={cn("type-caption", state !== "done" && "text-t3")}>{x.verb}</span>
            </li>
          );
        })}
      </ol>
      <div role="group" aria-label={`Things you can ${s.verb}`} className="flex flex-wrap gap-2">
        {s.ideas.map((v) => (
          <SoftChip key={v} label={v} selected={mine.includes(v)} onClick={() => toggle(v)} />
        ))}
      </div>
      <div className="flex w-full items-center gap-3 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <Orb size={34} />
        <p className="flex-1 type-body-s text-t1" aria-live="polite">
          {mine.length} of {s.n}. {enough ? "That's it — move on when you're ready." : ENCOURAGE[Math.min(mine.length, 3)]}
        </p>
      </div>
      <Grow />
      <Pill
        label={sense < 4 ? "Next sense" : "I'm back in the room"}
        className="w-full"
        onClick={() => (sense < 4 ? setSense(sense + 1) : router.push("/check-in/rerate?tool=ground"))}
      />
    </FigmaScreen>
  );
}
