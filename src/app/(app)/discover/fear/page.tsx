"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CARD, OHeader, ORow } from "@/components/discover/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Message } from "@/components/ui/message";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { type Fear, fears, uid } from "@/lib/discover";

const FIELD = "w-full resize-none [field-sizing:content] bg-transparent type-body-m text-t1 outline-none placeholder:text-t3";

function Likely({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className={cn("flex w-full flex-col gap-2 p-3.5", CARD)}>
      <div className="flex items-center">
        <p className="flex-1 type-label-m text-t1">{label}</p>
        <p className="type-title-m text-lime-deep">{value}%</p>
      </div>
      <div className="relative h-[22px] w-full">
        <div className="absolute top-[7px] h-2 w-full rounded-[4px] bg-peach-soft" />
        <div className="absolute top-[7px] h-2 rounded-[4px]" style={{ width: `${value}%`, backgroundImage: "var(--gradient-lime)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma knob */}
        <img src="/figma/knob-limedeep-22.svg" alt="" aria-hidden width={22} height={22} className="pointer-events-none absolute top-0" style={{ left: `calc(${value}% - 11px)` }} />
        <input type="range" aria-label={label} min={0} max={100} step={5} value={value} onChange={(e) => onChange(+e.target.value)} className="absolute inset-0 w-full cursor-pointer opacity-0" />
      </div>
    </div>
  );
}

/** O5 · Test a fear (behaviour experiment) — Figma node 146:4727. Part 1: predict. Part 2: what actually happened. */
export default function TestAFear() {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<Fear>({ id: "", at: "", fear: "", predicted: 80, experiment: "", when: "" });
  useEffect(() => {
    const open = fears.all().find((x) => !x.actual && x.actual !== 0);
    setF(open ?? { id: uid(), at: new Date().toISOString(), fear: "", predicted: 80, experiment: "", when: "" }); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);
  const set = (patch: Partial<Fear>) =>
    setF((x) => {
      const next = { ...x, ...patch };
      if (next.fear.trim()) fears.add(next);
      return next;
    });
  const finished = f.actual !== undefined && !!f.happened;

  return (
    <FigmaScreen gap={12} mood="calm">
      <OHeader icon="chevron-left" label="Back" title="Test a fear" sub="Behaviour experiment · 2 parts" onClick={() => router.back()} />
      <div className="flex w-full flex-col gap-1.5 rounded-[22px] bg-lavender-soft p-4">
        <p className="type-label-s text-lavender-text">THE FEAR</p>
        <textarea aria-label="The fear" rows={2} value={f.fear} onChange={(e) => set({ fear: e.target.value })} placeholder="If I…, then…" className={FIELD} />
      </div>
      <Likely label="How likely before you try?" value={f.predicted} onChange={(v) => set({ predicted: v })} />
      <ORow icon="target-limedeep-19" tileBg="bg-lime-soft" title="The experiment" note={f.experiment ? `${f.experiment}${f.when ? ` · ${f.when}` : ""}` : "What will you try, and when?"}>
        {f.doneAt ? (
          <span className="type-label-m text-lime-deep">Done</span>
        ) : (
          <button type="button" disabled={!f.fear.trim() || !f.experiment.trim()} onClick={() => set({ doneAt: new Date().toISOString() })} className="cursor-pointer type-label-m text-lime-deep disabled:cursor-not-allowed disabled:text-t3">
            Done
          </button>
        )}
      </ORow>
      {!f.doneAt && (
        <div className={cn("flex w-full gap-2 p-3", CARD)}>
          <input aria-label="The experiment" value={f.experiment} onChange={(e) => set({ experiment: e.target.value })} placeholder="e.g. Send it in writing" className="min-w-0 flex-1 bg-transparent type-body-s text-t1 outline-none placeholder:text-t3" />
          <input aria-label="When" value={f.when} onChange={(e) => set({ when: e.target.value })} placeholder="When?" className="w-24 bg-transparent type-body-s text-t1 outline-none placeholder:text-t3" />
        </div>
      )}
      {f.doneAt && (
        <div className="flex w-full flex-col gap-2.5 rounded-[22px] border border-line-strong bg-surface p-4">
          <p className="type-label-s text-lime-deep">WHAT ACTUALLY HAPPENED</p>
          <textarea aria-label="What actually happened" rows={2} value={f.happened ?? ""} onChange={(e) => set({ happened: e.target.value })} placeholder="Just the facts" className={FIELD} />
          {f.actual === undefined ? (
            <label className="flex items-center gap-2 type-body-s text-t2">
              How much of the fear came true?
              <input aria-label="How much came true" type="number" min={0} max={100} step={5} placeholder="%" onKeyDown={(e) => e.key === "Enter" && set({ actual: Math.min(100, Math.max(0, +(e.target as HTMLInputElement).value)) })} onBlur={(e) => e.target.value && set({ actual: Math.min(100, Math.max(0, +e.target.value)) })} className="w-16 rounded-[10px] border border-line px-2 py-1 outline-none focus:border-lime-deep" />
            </label>
          ) : (
            <div className="flex w-full gap-2.5">
              <div className="flex flex-1 flex-col items-center gap-0.5 rounded-[16px] bg-peach-soft p-3 text-peach-text">
                <p className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px]">{f.predicted}%</p>
                <p className="type-caption">Predicted</p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-0.5 rounded-[16px] bg-lime-soft p-3 text-lime-deep">
                <p className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px]">{f.actual}%</p>
                <p className="type-caption">Happened</p>
              </div>
            </div>
          )}
        </div>
      )}
      {finished && (
        <Message role="evo">
          {f.actual! < f.predicted ? `Your brain predicted ${f.predicted}%. Reality was ${f.actual}%. Worth remembering next time.` : f.actual === f.predicted ? "It went the way you feared — and you got through it. That counts too." : "It was harder than you guessed. You still did it. Want to plan what helps next time?"}
        </Message>
      )}
      <Grow />
      {finished && (
        <Pill
          label="Save this experiment"
          className="w-full"
          onClick={() => {
            toast.show("Saved to your evidence.");
            router.push("/discover");
          }}
        />
      )}
    </FigmaScreen>
  );
}
