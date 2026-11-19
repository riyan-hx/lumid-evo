"use client";

import Link from "next/link";
import { useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { type Chat, useChats } from "@/lib/chat";
import { chatRow, isRecord, matches, rowTime } from "@/lib/chat-list";

const FILTERS: { label: string; test: (c: Chat) => boolean }[] = [
  { label: "All", test: () => true },
  { label: "Vent", test: (c) => c.mode === "listen" },
  { label: "Voice", test: (c) => !!c.voice },
  { label: "Thought records", test: isRecord },
];

/** 3.6 · Chats — Figma node 117:2086 */
export default function Chats() {
  const { chats, ready } = useChats();
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const test = FILTERS.find((f) => f.label === filter)!.test;
  const list = chats.filter((c) => c.parts.some((p) => p.t === "me") && test(c) && matches(c, q));
  const hasResults = chats.some((c) => c.fairer || c.step || c.insights.length);

  return (
    <FigmaScreen gap={12} className="pb-[110px]">
      <div className="flex w-full flex-col gap-px">
        <h1 className="type-label-m text-t1">Chats</h1>
        <p className="type-caption text-t3">Private to you</p>
      </div>
      <label className="flex w-full items-center gap-2.5 rounded-[18px] border border-white bg-surface p-3">
        <FigmaIcon name="target-t3-18" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your chats" aria-label="Search your chats" className="min-w-0 flex-1 bg-transparent type-body-m text-t1 outline-none placeholder:text-t3" />
      </label>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <SoftChip key={f.label} label={f.label} selected={filter === f.label} onClick={() => setFilter(f.label)} />
        ))}
      </div>

      {list.length > 0 ? (
        <ul className="flex w-full flex-col rounded-[22px] border border-white bg-white/78 px-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          {list.map((c) => {
            const r = chatRow(c);
            return (
              <li key={c.id}>
                <Link href={c.endedAt ? `/chat/summary?id=${c.id}` : `/chat/live?id=${c.id}`} className="flex w-full items-center gap-3 py-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-[12px] ${r.bg}`}>
                    <FigmaIcon name={r.icon} size={19} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate type-label-m text-t1">{r.title}</span>
                    <span className="truncate type-caption text-t3">{r.note}</span>
                  </span>
                  <span className="shrink-0 type-caption text-t3">{rowTime(c.updatedAt)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        ready && (
          <div className="flex w-full flex-col items-start gap-2.5 rounded-[22px] border border-white bg-white/78 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
            <p className="type-body-m text-t2">{q || filter !== "All" ? "Nothing matches yet." : "No chats yet. When you talk with Evo, they'll live here — only on this phone."}</p>
            <Link href="/chat" className="type-label-m text-lime-deep">
              Talk with Evo
            </Link>
          </div>
        )
      )}

      <div className="flex w-full items-center gap-2">
        <FigmaIcon name="lock-14" size={14} />
        <p className="type-caption text-t3">Chats are never shared unless you choose to.</p>
      </div>
      {chats.filter((c) => c.parts.some((p) => p.t === "me")).length >= 3 && (
        <Link href="/insights/noticed" className="type-label-m text-lime-deep">
          What Evo noticed →
        </Link>
      )}
      {hasResults && (
        <Link href="/chats/results" className="type-label-m text-lime-deep">
          Reframes, steps and insights you kept →
        </Link>
      )}
    </FigmaScreen>
  );
}
