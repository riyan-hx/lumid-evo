"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";

const CHOICES = [
  { label: "Worse", delta: 10 },
  { label: "Same", delta: 0 },
  { label: "A bit better", delta: -25 },
  { label: "Much better", delta: -45 },
];
const TOOL_NAMES: Record<string, string> = { breathe: "1 minute of breathing", ground: "grounding", relax: "muscle relaxation", tipp: "TIPP", chat: "your chat", thought: "the thought record" };
const MAX = 200; // bar px at 100

/** C10 · How do you feel now? — Figma node 136:2949. Reached as /check-in/rerate?tool=breathe after any tool. */
function Rerate() {
  const router = useRouter();
  const tool = useSearchParams().get("tool") ?? "breathe";
  const { items, rerates, addRerate } = useCheckIns();
  const last = items[0];
  const [choice, setChoice] = useState<number | null>(null);

  const rows = last
    ? [
        { measure: last.feeling, before: last.intensity },
        ...(last.body?.length ? [{ measure: "Tense body", before: Math.max(20, last.intensity - 10) }] : []),
      ]
    : [{ measure: "Feeling", before: 60 }];
  const after = (b: number) => (choice === null ? null : Math.max(0, Math.min(100, b + CHOICES[choice].delta)));

  // "Evo learns": average drop for this tool across past re-rates (own data only).
  const past = rerates.filter((r) => r.tool === tool);
  const avgDrop = past.length ? Math.round(past.reduce((a, r) => a + (r.before - r.after), 0) / past.length) : null;

  function done() {
    if (choice !== null) rows.forEach((r) => addRerate({ tool, measure: r.measure, before: r.before, after: after(r.before) ?? r.before }));
    router.push("/home");
  }

  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={() => router.push("/home")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-surface">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <div className="flex w-full justify-center">
        <Orb size={84} />
      </div>
      <h1 className="text-center text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">How do you feel now?</h1>
      <p className="text-center type-body-m text-t2">After {TOOL_NAMES[tool] ?? "that"}.</p>
      <div className="flex w-full flex-col gap-3 rounded-[22px] border border-white bg-surface p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
        <p className="type-label-s text-t3">BEFORE → NOW</p>
        {rows.map((r) => {
          const a = after(r.before);
          return (
            <div key={r.measure} className="flex items-center gap-2.5">
              <p className="w-[70px] type-body-s text-t2">{r.measure}</p>
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-2.5 rounded-[5px] bg-peach-soft" style={{ width: (r.before / 100) * MAX }} />
                {a !== null && <div className="h-2.5 rounded-[5px]" style={{ width: Math.max(6, (a / 100) * MAX), backgroundImage: "var(--gradient-lime)" }} />}
              </div>
              <p className="type-label-m whitespace-nowrap text-t1">
                {r.before} → {a ?? "?"}
              </p>
            </div>
          );
        })}
      </div>
      <div role="group" aria-label="How do you feel now" className="flex w-full flex-wrap gap-2">
        {CHOICES.map((c, i) => (
          <SoftChip key={c.label} label={c.label} selected={choice === i} onClick={() => setChoice(i)} />
        ))}
      </div>
      {avgDrop !== null && avgDrop > 0 && (
        <div className="flex w-full flex-col gap-1.5 rounded-[22px] border border-white p-4" style={{ backgroundImage: "linear-gradient(163.84deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
          <p className="type-label-s text-lime-deep">EVO LEARNS</p>
          <p className="type-body-m text-forest">
            {(TOOL_NAMES[tool] ?? "This")[0].toUpperCase() + (TOOL_NAMES[tool] ?? "this").slice(1)} brings your {rows[0].measure.toLowerCase()} down about {avgDrop} points. I&apos;ll suggest it earlier next time.
          </p>
        </div>
      )}
      <Grow />
      <Pill label="Done" className="w-full" onClick={done} />
      <button type="button" onClick={() => router.push("/calm")} className="cursor-pointer text-center type-label-m text-t2">
        Still high? Try grounding next
      </button>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Rerate />
    </Suspense>
  );
}
