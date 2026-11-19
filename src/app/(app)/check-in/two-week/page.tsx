"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";

/** PHQ-2 style items. Wording and threshold must be confirmed by the clinical team (SAFETY). */
const ITEMS = ["…had little interest or pleasure in doing things?", "…felt down, low or hopeless?"];
const ANSWERS = ["Not at all", "Several days", "More than half", "Nearly every day"];
const THRESHOLD = 3;

/** C9 · Two-week check (opt-in) — Figma node 136:2883 */
export default function TwoWeekCheck() {
  const router = useRouter();
  const [scores, setScores] = useState<(number | null)[]>([null, null]);
  const complete = scores.every((s) => s !== null);
  const total = scores.reduce<number>((a, s) => a + (s ?? 0), 0);

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader solid icon="close" label="Close" title="A two-week check" sub="Optional · every 14 days · 1 minute" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">Over the last two weeks, how often have you…</h1>
      <p className="type-body-m text-t2">Two short questions used by doctors worldwide. Not a diagnosis.</p>
      {ITEMS.map((q, qi) => (
        <fieldset key={q} className="flex w-full flex-col gap-2.5 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
          <legend className="sr-only">{q}</legend>
          <p className="type-label-m text-t1">{q}</p>
          <div className="flex flex-wrap gap-1.5">
            {ANSWERS.map((a, ai) => (
              <SoftChip key={a} label={a} selected={scores[qi] === ai} onClick={() => setScores((s) => s.map((x, i) => (i === qi ? ai : x)))} />
            ))}
          </div>
        </fieldset>
      ))}
      {complete && (
        <div role="status" className="flex w-full flex-col gap-2 rounded-[22px] bg-sun-soft p-4">
          <p className="type-label-s text-sun-text">WHAT THIS MIGHT MEAN</p>
          <p className="type-body-m text-t1">
            {total >= THRESHOLD
              ? "Your answers suggest these two weeks have been hard. Talking to someone could really help."
              : "Thanks for checking. Keep noticing how you feel — Evo is here when it gets heavier."}
          </p>
          <div className="flex flex-wrap gap-2">
            {total >= THRESHOLD ? (
              <>
                <SoftChip label="Find support" selected onClick={() => router.push("/crisis")} />
                <SoftChip label="Talk to Evo" onClick={() => router.push("/chat")} />
              </>
            ) : (
              <SoftChip label="Done" selected onClick={() => router.push("/home")} />
            )}
          </div>
        </div>
      )}
      <Grow />
      <p className="type-caption text-t3">Turn off in You → Check-ins. Results are private unless you share them.</p>
    </FigmaScreen>
  );
}
