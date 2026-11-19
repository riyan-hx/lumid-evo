"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { RadioDot } from "@/components/chat/parts";
import { FigmaIcon, FlowHeader, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { dayLabel, useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { stepIdeas } from "@/lib/evo-engine";

const WHEN = ["Tomorrow 10:00", "After lunch", "Pick a time"];

/** X10 · One small next step — Figma node 142:3637 */
function StepPage() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const { chats, update } = useChats();
  const chat = chats.find((c) => c.id === id);
  const ideas = stepIdeas(chat ?? { topic: "", thought: "" });
  const [pick, setPick] = useState<number | null>(null);
  const [when, setWhen] = useState<string | null>(null);
  const [time, setTime] = useState("18:00");
  const [doable, setDoable] = useState<number | null>(null);
  const [smaller, setSmaller] = useState(false);

  const existing = chat?.step;
  const idx = pick ?? Math.max(0, ideas.findIndex((i) => i.text === existing?.text));
  const chosenWhen = when ?? (existing ? (WHEN.includes(existing.when) ? existing.when : "Pick a time") : WHEN[0]);
  const score = doable ?? existing?.doable ?? 8;
  const idea = ideas[idx];
  const text = smaller ? `Just start: ${idea.text[0].toLowerCase()}${idea.text.slice(1)}, for 2 minutes` : idea.text;

  function commit() {
    if (!chat) return router.push("/chat");
    if (score < 7 && !smaller) {
      setSmaller(true);
      setDoable(8);
      return;
    }
    const at = chosenWhen === "Pick a time" ? `Today ${time}` : chosenWhen;
    update(chat.id, (c) => ({ ...c, step: { text, note: idea.note, when: at, doable: score } }));
    router.push(`/chat/summary?id=${chat.id}`);
  }

  return (
    <FigmaScreen gap={12}>
      <FlowHeader solid icon="chevron-left" label="Back" title="One small step" sub={`From ${chat ? dayLabel(chat.startedAt).toLowerCase() : "today"}'s chat`} onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">What&apos;s one small thing you could do?</h1>
      <p className="type-body-m text-t2">Small enough that you&apos;d still do it on a hard day.</p>
      <div role="radiogroup" aria-label="Small steps" className="flex w-full flex-col gap-3">
        {ideas.map((s, i) => {
          const on = i === idx;
          return (
            <button
              key={s.text}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setPick(i);
                setSmaller(false);
              }}
              className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[18px] border p-3 text-left", on ? "border-lime bg-lime-soft" : "border-white bg-white/85")}
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[12px]", s.bg)}>
                <FigmaIcon name={s.icon} size={19} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{on ? text : s.text}</span>
                <span className="type-caption text-t3">{s.note}</span>
              </span>
              <RadioDot on={on} />
            </button>
          );
        })}
      </div>
      <SectionLabel>WHEN?</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {WHEN.map((w) => (
          <SoftChip key={w} label={w} selected={chosenWhen === w} onClick={() => setWhen(w)} />
        ))}
      </div>
      {chosenWhen === "Pick a time" && <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time for your step" className="h-11 w-full rounded-[14px] border border-white bg-surface px-3 type-body-m text-t1" />}
      <div className="flex w-full flex-col gap-2 rounded-[18px] border border-white bg-white/85 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <div className="flex items-center">
          <p className="flex-1 type-label-m text-t1">How doable does it feel?</p>
          <p className="type-title-m text-lime-deep">{score} / 10</p>
        </div>
        <div role="radiogroup" aria-label="How doable does it feel?" className="flex w-full gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <button key={i} type="button" role="radio" aria-checked={score === i + 1} aria-label={`${i + 1} of 10`} onClick={() => setDoable(i + 1)} className={cn("h-2 flex-1 cursor-pointer rounded-[4px]", i < score ? "bg-lime" : "bg-subtle")} />
          ))}
        </div>
        <p className="type-caption text-t3">{score < 7 ? "Let's make it smaller — tap below and Evo will shrink it." : "Under 7? Evo will help make it smaller."}</p>
      </div>
      <Grow />
      <Pill label={score < 7 && !smaller ? "Make it smaller" : "Commit to it"} className="w-full" onClick={commit} />
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StepPage />
    </Suspense>
  );
}
