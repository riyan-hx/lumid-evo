"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AskEvoSheet } from "@/components/chat/ask-evo-sheet";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { AskEvo, SoftChip } from "@/components/ui/controls";
import { useChats } from "@/lib/chat";
import { noticePattern } from "@/lib/insight";

const ROWS = [
  { key: "happening", title: "What's happening", icon: "cloud-sky-17", bg: "bg-sky-soft" },
  { key: "why", title: "Why it happens", icon: "brain-lav-17", bg: "bg-lavender-soft" },
  { key: "help", title: "What might help", icon: "heart-peach-17", bg: "bg-peach-soft" },
] as const;

/** 3.4 · Evo noticed — Figma node 117:1944 */
export default function Noticed() {
  const router = useRouter();
  const toast = useToast();
  const { chats, ready, update } = useChats();
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const insight = noticePattern(chats);

  function feedback(v: string) {
    setAnswer(v);
    if (v === "Look at the thought") return router.push("/chat/live?mode=untangle");
    if (v === "Yes, that's me" && insight && chats[0]) update(chats[0].id, (c) => ({ ...c, insights: [...new Set([...c.insights, insight.title])] }));
    toast.show(v === "Yes, that's me" ? "Saved to your insights" : "Thanks — Evo will weigh this less");
  }

  return (
    <FigmaScreen gap={14}>
      <div className="flex w-full items-center gap-2.5">
        <div className="flex-1">
          <FlowHeader icon="chevron-left" label="Back" title="What Evo noticed" sub="" onClick={() => router.back()} />
        </div>
        {insight && <AskEvo onClick={() => setAsking(true)} />}
      </div>

      {insight ? (
        <>
          <section className="flex w-full flex-col gap-3 rounded-[28px] border border-white bg-white/78 p-[18px] shadow-[0_18px_40px_-12px_rgba(21,26,19,0.12)] backdrop-blur-[12px]">
            <div className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-[9px] bg-lime-soft">
                <FigmaIcon name="sparkle-limedeep-14" size={14} />
              </span>
              <p className="flex-1 type-label-s text-lime-deep">Evo insight</p>
              <span className="rounded-full bg-sun-soft px-2.5 py-[5px] type-caption text-sun-text">{insight.confidence} confidence</span>
            </div>
            <h1 className="type-title-l text-forest">{insight.title}</h1>
            {ROWS.map((r) => (
              <div key={r.key} className="flex w-full items-start gap-2.5 rounded-[18px] bg-subtle p-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-[11px] ${r.bg}`}>
                  <FigmaIcon name={r.icon} size={17} />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="type-label-m text-t1">{r.title}</p>
                  <p className="type-body-s text-t2">{insight[r.key]}</p>
                </div>
              </div>
            ))}
            <p className="type-caption text-t3">Based on {insight.basedOn} chats · a pattern, not a diagnosis</p>
          </section>
          <p className="type-label-m text-t2">Does this feel right?</p>
          <div className="flex flex-wrap gap-2">
            {["Yes, that's me", "Not quite", "Look at the thought"].map((v) => (
              <SoftChip key={v} label={v} selected={answer === v} onClick={() => feedback(v)} />
            ))}
          </div>
          {asking && <AskEvoSheet about={insight.title} basedOn={insight.basedOn} confidence={insight.confidence} onClose={() => setAsking(false)} />}
        </>
      ) : (
        ready && (
          <section className="flex w-full flex-col gap-3 rounded-[28px] border border-white bg-white/78 p-[18px] shadow-[0_18px_40px_-12px_rgba(21,26,19,0.12)]">
            <h1 className="type-title-l text-forest">Nothing to notice yet.</h1>
            <p className="type-body-m text-t2">After a few chats, Evo can point out a pattern — always with how sure it is, never a diagnosis.</p>
            <SoftChip label="Talk with Evo" selected onClick={() => router.push("/chat")} className="self-start" />
          </section>
        )
      )}
    </FigmaScreen>
  );
}
