"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { type Answer, askEvo } from "@/lib/insight";

/** 3.5 · Ask Evo (sheet) — context-aware questions about any card. Figma node 117:2015 */
export function AskEvoSheet({ about, basedOn, confidence, first, onClose }: { about: string; basedOn: number; confidence: string; first?: string; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState(first ?? "");
  const [turns, setTurns] = useState<{ q: string; a: Answer }[]>(() => (first ? [{ q: first, a: askEvo(first, { about, basedOn, confidence }) }] : []));
  const last = turns.at(-1);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  function ask() {
    const t = q.trim();
    if (!t) return;
    setTurns((ts) => [...ts, { q: t, a: askEvo(t, { about, basedOn, confidence }) }]);
    setQ("");
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Ask Evo about this" className="fixed inset-0 z-50">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[rgba(21,26,19,0.35)] evo-enter-fade" />
      <div className="absolute inset-x-0 top-[220px] bottom-0 mx-auto flex w-full max-w-[430px] flex-col gap-3 overflow-y-auto rounded-t-[32px] bg-surface p-[22px] shadow-[0_-10px_40px_rgba(21,26,19,0.2)] evo-enter">
        <div className="flex justify-center">
          <span className="h-[5px] w-10 rounded-[3px] bg-line-strong" />
        </div>
        <div className="flex items-center gap-2.5">
          <Orb size={32} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="type-label-m text-t1">Ask Evo about this</p>
            <p className="truncate type-caption text-peach-text">&quot;{about}&quot;</p>
          </div>
        </div>
        {turns.map((t, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex justify-end">
              <p className="rounded-[22px] px-4 py-[11px] type-label-m text-white" style={{ backgroundImage: "var(--gradient-forest)" }}>
                {t.q}
              </p>
            </div>
            <p className="type-body-m text-t1">{t.a.text}</p>
            <dl className="flex flex-col gap-2 rounded-[18px] bg-subtle p-3">
              {[
                ["Evidence", t.a.evidence],
                ["Confidence", t.a.confidence],
                ["Try", t.a.tryThis],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2.5">
                  <dt className="w-20 shrink-0 type-caption text-t3">{k}</dt>
                  <dd className="flex-1 type-body-s text-t1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {last && (
          <div className="flex flex-wrap gap-2">
            {last.a.action && <SoftChip label={last.a.action.label} selected onClick={() => router.push(last.a.action!.href)} />}
            <SoftChip label="Open full chat" onClick={() => router.push(`/chat/live?q=${encodeURIComponent(last.q)}`)} />
          </div>
        )}
        <div className="flex-1" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="flex w-full items-center gap-1.5 rounded-[30px] border border-lime bg-surface py-1.5 pr-1.5 pl-[18px] shadow-[0_12px_28px_-10px_rgba(21,26,19,0.22)]"
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder={turns.length ? "Ask a follow-up…" : "Ask anything about this…"} aria-label="Ask Evo" className="min-w-0 flex-1 bg-transparent type-body-m text-t1 outline-none placeholder:text-t3" />
          <button type="button" aria-label="Speak instead" onClick={() => router.push("/voice")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] bg-subtle">
            <FigmaIcon name="mic-20" size={20} />
          </button>
          <button type="submit" aria-label="Ask" className="flex size-12 cursor-pointer items-center justify-center rounded-[24px]" style={{ backgroundImage: "linear-gradient(135deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
            <FigmaIcon name="send-white" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
