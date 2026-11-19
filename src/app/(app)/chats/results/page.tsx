"use client";

import Link from "next/link";
import { useState } from "react";
import { coreOf } from "@/components/chat/parts";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { type Chat, dayLabel, useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";

type Item =
  | { kind: "reframe"; chat: Chat; at: string }
  | { kind: "step"; chat: Chat; at: string }
  | { kind: "insight"; text: string; label: string; confidence?: string; at: string };

const FILTERS = ["All", "Reframes", "Steps", "Insights"] as const;
const KIND = { Reframes: "reframe", Steps: "step", Insights: "insight" } as const;
const CARD = "flex w-full rounded-[20px] border border-white bg-white/85 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]";

/** Topics that keep coming back across chats become a pattern insight (needs 3+ chats). */
function patterns(chats: Chat[]): Item[] {
  const by = new Map<string, Chat[]>();
  for (const c of chats) if (c.topic) by.set(c.topic, [...(by.get(c.topic) ?? []), c]);
  return [...by.entries()]
    .filter(([, cs]) => cs.length >= 3)
    .map(([topic, cs]) => ({
      kind: "insight",
      label: `INSIGHT · ${cs.length} CHATS`,
      confidence: cs.length >= 8 ? "High confidence" : cs.length >= 5 ? "Medium confidence" : "Low confidence",
      text: `${topic[0].toUpperCase() + topic.slice(1)} keeps coming up — it may be worth a session of its own.`,
      at: cs[0].updatedAt,
    }));
}

/** X13 · Your chat results — Figma node 144:3520 */
export default function Results() {
  const { chats, update, ready } = useChats();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const items: Item[] = [
    ...chats.filter((c) => c.fairer).map((c) => ({ kind: "reframe" as const, chat: c, at: c.updatedAt })),
    ...chats.filter((c) => c.step).map((c) => ({ kind: "step" as const, chat: c, at: c.step!.doneAt ?? c.updatedAt })),
    ...chats.flatMap((c) => c.insights.map((text) => ({ kind: "insight" as const, text, label: `INSIGHT · SAVED ${dayLabel(c.updatedAt).toUpperCase()}`, at: c.updatedAt }))),
    ...patterns(chats),
  ]
    .filter((i) => filter === "All" || i.kind === KIND[filter])
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <FigmaScreen gap={12} className="pb-[124px]">
      <div className="flex w-full flex-col gap-px">
        <h1 className="type-title-m text-t1">From your chats</h1>
        <p className="type-caption text-t3">Reframes, steps and insights you kept</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <SoftChip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {items.map((i, n) => {
        if (i.kind === "reframe") {
          const c = i.chat;
          return (
            <div key={`r${c.id}`} className={cn(CARD, "flex-col gap-2")}>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-[9px] bg-lavender-soft">
                  <FigmaIcon name="brain-lav-15" size={15} />
                </span>
                <p className="flex-1 type-label-s text-lavender-text">REFRAME · {dayLabel(c.updatedAt).toUpperCase()}</p>
                <button type="button" aria-label={c.starred ? "Unstar" : "Star"} aria-pressed={!!c.starred} onClick={() => update(c.id, (x) => ({ ...x, starred: !x.starred }))} className={cn("cursor-pointer rounded-full", !c.starred && "opacity-60")}>
                  <FigmaIcon name="star-sun-16" size={16} />
                </button>
              </div>
              <p className="type-label-m text-t1">{c.fairer}</p>
              {c.belief && (
                <span className="self-start rounded-full bg-lime-soft px-2.5 py-1 type-caption text-lime-deep">
                  Belief &quot;{coreOf(c.thought ?? "").replace(/^I'?m /i, "")}&quot; {c.belief[0]} → {c.belief[1]}
                </span>
              )}
            </div>
          );
        }
        if (i.kind === "step") {
          const { chat: c } = i;
          const s = c.step!;
          return (
            <div key={`s${c.id}`} className={cn(CARD, "items-center gap-3")}>
              <span className="flex size-9 items-center justify-center rounded-[12px] bg-lime-soft">
                <FigmaIcon name="target-limedeep-19" size={19} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{s.text}</span>
                <span className="type-caption text-t3">Step · {s.done && s.doneAt ? `done ${dayLabel(s.doneAt)}` : s.when.toLowerCase()}</span>
              </span>
              <button
                type="button"
                role="checkbox"
                aria-checked={!!s.done}
                aria-label={`Mark "${s.text}" done`}
                onClick={() => update(c.id, (x) => ({ ...x, step: { ...x.step!, done: !x.step!.done, doneAt: x.step!.done ? undefined : new Date().toISOString() } }))}
                className={cn("flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-[13px]", s.done ? "bg-lime-deep" : "border border-line-strong bg-surface")}
              >
                {s.done && <FigmaIcon name="check-white-14" size={14} />}
              </button>
            </div>
          );
        }
        return (
          <div key={`i${n}`} className={cn(CARD, "flex-col gap-2")}>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-[9px] bg-sky-soft">
                <FigmaIcon name="sparkle-sky-15" size={15} />
              </span>
              <p className="flex-1 type-label-s text-sky-text">{i.label}</p>
              {i.confidence && <span className="rounded-full bg-sun-soft px-2 py-[3px] type-caption text-sun-text">{i.confidence}</span>}
            </div>
            <p className="type-body-m text-t1">{i.text}</p>
          </div>
        );
      })}

      {ready && !items.length && (
        <div className={cn(CARD, "flex-col items-start gap-2.5")}>
          <p className="type-body-m text-t2">Reframes, small steps and insights you keep from chats will collect here.</p>
          <Link href="/chat" className="type-label-m text-lime-deep">
            Talk with Evo
          </Link>
        </div>
      )}
    </FigmaScreen>
  );
}
