"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FlowHeader, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { ideaNote, problems } from "@/lib/tool-store";

const STEPS = ["DEFINE IT", "IDEAS", "PICK ONE", "TINY PLAN", "TRY IT"];
const WHEN = ["Today", "Tomorrow", "This weekend"];
const CARD = "flex w-full rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]";

/** 5.4 · Solve one problem — Figma node 120:2190 (shown at step 3 of 5). */
export default function SolveProblem() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [idea, setIdea] = useState("");
  const [pick, setPick] = useState("");
  const [first, setFirst] = useState("");
  const [when, setWhen] = useState(WHEN[0]);

  const addIdea = () => {
    const t = idea.trim();
    if (t && !ideas.includes(t)) setIdeas([...ideas, t]);
    setIdea("");
  };
  const problemCard = (
    <div className={cn(CARD, "flex-col gap-1.5")}>
      <p className="type-label-s text-t3">THE PROBLEM</p>
      {step === 0 ? (
        <textarea autoFocus value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} placeholder="One sentence — what's the problem?" aria-label="The problem" className="w-full resize-none bg-transparent type-title-l text-forest outline-none placeholder:text-t3" />
      ) : (
        <p className="type-title-l text-forest">{problem}</p>
      )}
    </div>
  );
  const next: Record<number, { label: string; ok: boolean; go: () => void }> = {
    0: { label: "Next", ok: !!problem.trim(), go: () => setStep(1) },
    1: { label: "Next", ok: ideas.length > 0, go: () => {
        setPick(ideas[0]);
        setStep(2);
      },
    },
    2: { label: "Make a tiny plan for it", ok: !!pick, go: () => setStep(3) },
    3: { label: "Save my plan", ok: !!first.trim(), go: () => setStep(4) },
    4: {
      label: "Done",
      ok: true,
      go: () => {
        problems.add({ problem, ideas, pick, step: first, when });
        toast.show(`Plan saved · ${when.toLowerCase()}`);
        router.push("/tools");
      },
    },
  };

  return (
    <FigmaScreen gap={12}>
      <FlowHeader icon="chevron-left" label="Back" title="Solve one problem" sub="5 small steps" onClick={() => (step ? setStep(step - 1) : router.back())} />
      <div className="flex w-full gap-[5px]" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={cn("h-1.5 flex-1 rounded-[3px]", i > step && "bg-line-strong")} style={i <= step ? { backgroundImage: "linear-gradient(174.73deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined} />
        ))}
      </div>
      <p className="type-label-s text-lime-deep">
        STEP {step + 1} OF 5 · {STEPS[step]}
      </p>
      {problemCard}

      {step === 1 && (
        <>
          <p className="type-label-m text-t2">Your ideas — no judging</p>
          {ideas.map((i) => (
            <div key={i} className={cn(CARD, "rounded-[18px] p-3 type-label-m text-t1")}>
              {i}
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addIdea();
            }}
            className="flex w-full items-center gap-2.5 rounded-[18px] border border-dashed border-lime bg-surface p-3"
          >
            <FigmaIcon name="plus-limedeep-14" size={14} />
            <input autoFocus value={idea} onChange={(e) => setIdea(e.target.value)} onBlur={addIdea} placeholder={ideas.length ? "Another idea, even a silly one" : "Any idea at all"} aria-label="Add an idea" className="min-w-0 flex-1 bg-transparent type-label-m text-t1 outline-none placeholder:text-lime-deep" />
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <p className="type-label-m text-t2">Your ideas — no judging</p>
          <div role="radiogroup" aria-label="Pick one idea" className="flex w-full flex-col gap-3">
            {ideas.map((i) => {
              const on = pick === i;
              return (
                <button key={i} type="button" role="radio" aria-checked={on} onClick={() => setPick(i)} className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78")}>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="type-label-m text-t1">{i}</span>
                    <span className="type-caption text-t3">{ideaNote(i)}</span>
                  </span>
                  {on && <FigmaIcon name="check-limedeep-20" size={20} />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className={cn(CARD, "flex-col gap-1.5 rounded-[18px]")}>
            <p className="type-label-s text-t3">YOUR PICK</p>
            <p className="type-label-m text-t1">{pick}</p>
          </div>
          <SectionLabel>THE FIRST TINY STEP</SectionLabel>
          <input autoFocus value={first} onChange={(e) => setFirst(e.target.value)} placeholder="So small you can't fail — e.g. write the first line" aria-label="First tiny step" className="h-12 w-full rounded-[18px] border border-dashed border-lime bg-surface px-3 type-label-m text-t1 outline-none" />
          <SectionLabel>WHEN</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {WHEN.map((w) => (
              <SoftChip key={w} label={w} selected={when === w} onClick={() => setWhen(w)} />
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <div className="flex w-full flex-col gap-2 rounded-[24px] border border-white p-4" style={{ backgroundImage: "linear-gradient(157.63deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
          <p className="type-label-s text-lime-deep">YOUR TINY PLAN · {when.toUpperCase()}</p>
          <p className="type-title-l text-forest">{first}</p>
          <p className="type-body-s text-t2">Toward: {pick}. Afterwards, ask: did it help? What&apos;s the next small step?</p>
        </div>
      )}

      <Grow />
      <Pill label={next[step].label} className="w-full" disabled={!next[step].ok} onClick={next[step].go} />
    </FigmaScreen>
  );
}
