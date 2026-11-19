"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { buildRungs, loadLadder, pickRung, type Rung, saveLadder } from "@/lib/ladder";

const BAR = ["bg-peach-solid", "bg-peach-soft", "bg-sun-soft", "bg-lime-soft", "bg-lime"];

/** 7.2 · Unstuck ladder — Figma node 125:2239 */
function Build() {
  const router = useRouter();
  const preset = useSearchParams().get("goal");
  const [goal, setGoal] = useState("");
  const [editing, setEditing] = useState(true);
  const [rungs, setRungs] = useState<Rung[]>([]);
  const [pick, setPick] = useState(-1);
  const [listening, setListening] = useState(false);
  const [auto, setAuto] = useState(-1);

  function make(g: string) {
    if (!g.trim()) return;
    const r = buildRungs(g);
    const i = pickRung(r, loadLadder()?.history ?? []);
    setGoal(g.trim());
    setRungs(r);
    setPick(i);
    setAuto(i);
    setEditing(false);
  }

  useEffect(() => {
    const saved = loadLadder();
    const g = preset ?? saved?.goal;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of device storage / link
    if (g) make(g);
  }, [preset]);

  function dictate() {
    type SR = { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; lang: string };
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return document.getElementById("goal")?.focus();
    const r = new Ctor();
    r.lang = "en-IN";
    r.onresult = (e) => make(Array.from(e.results, (x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title="Unstuck ladder" sub="Say it — Evo builds the steps" onClick={() => router.back()} />
      <div className="flex w-full items-center gap-3 rounded-[22px] p-3.5" style={{ backgroundImage: "linear-gradient(169.17deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <button type="button" aria-label={listening ? "Listening" : "Say it"} onClick={dictate} className="flex size-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[13px] bg-lime-soft">
          <FigmaIcon name="mic-limedeep-20" size={20} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="type-label-s text-lime">{editing ? "WHAT FEELS TOO BIG?" : "YOU SAID"}</p>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                make(goal);
              }}
            >
              <input id="goal" autoFocus value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={listening ? "Listening…" : "e.g. tell Riya why I disappeared"} aria-label="What feels too big" className="w-full bg-transparent type-label-m text-white outline-none placeholder:text-white/50" />
            </form>
          ) : (
            <p className="type-label-m text-white">&quot;{goal}&quot;</p>
          )}
        </div>
        <button type="button" aria-label={editing ? "Build my ladder" : "Edit"} onClick={() => (editing ? make(goal) : setEditing(true))} className="cursor-pointer">
          <FigmaIcon name="pencil-lime-18" size={18} />
        </button>
      </div>

      {rungs.length > 0 && (
        <>
          <div role="radiogroup" aria-label="Rungs, hardest first" className="flex w-full flex-col gap-2 rounded-[22px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            {rungs.map((r, i) => {
              const on = pick === i;
              return (
                <button key={r.text} type="button" role="radio" aria-checked={on} onClick={() => setPick(i)} className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-[16px] p-2.5 text-left", on ? "border-[1.5px] border-lime bg-lime-soft" : "bg-subtle")}>
                  <span className={cn("h-[30px] w-1.5 shrink-0 rounded-[3px]", BAR[i])} />
                  <span className="flex-1 type-label-m text-t1">{r.text}</span>
                  <span className="rounded-full bg-surface px-2 py-1 type-caption text-t2">dread {r.dread}</span>
                </button>
              );
            })}
          </div>
          <div className="flex w-full items-center gap-2.5 rounded-[16px] bg-surface p-3">
            <span className="flex size-[30px] items-center justify-center rounded-[10px] bg-lavender-soft">
              <FigmaIcon name="target-lav-16" size={16} />
            </span>
            <p className="flex-1 type-body-s text-t2">{pick === auto ? `Evo picked rung ${auto + 1} — ${loadLadder()?.history.length ? "just above what felt okay last time" : "small enough to start today"}.` : `Rung ${pick + 1} — your call. You can always step down.`}</p>
          </div>
        </>
      )}
      <Grow />
      <Pill
        label="Start with this rung"
        className="w-full"
        disabled={pick < 0}
        onClick={() => {
          const prev = loadLadder();
          saveLadder({ goal, rungs, current: pick, history: prev?.history ?? [], plannedAt: prev?.goal === goal ? prev.plannedAt : new Date().toISOString() });
          router.push("/ladder/moment");
        }}
      />
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Build />
    </Suspense>
  );
}
