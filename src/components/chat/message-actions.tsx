"use client";

import { useEffect, useRef } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { Orb } from "@/components/ui/orb";
import { cn } from "@/lib/cn";

export type MessageAction = "insight" | "simpler" | "malayalam" | "aloud" | "wrong";
export type Reaction = "heart" | "star" | "helpful";

const ACTIONS: { id: MessageAction; icon: string; bg: string; title: string; note: string }[] = [
  { id: "insight", icon: "star-sun-18", bg: "bg-sun-soft", title: "Save as insight", note: "Keep it in your library" },
  { id: "simpler", icon: "sparkle-lav-18", bg: "bg-lavender-soft", title: "Say it simpler", note: "Shorter, plainer words" },
  { id: "malayalam", icon: "chat-sky-18", bg: "bg-sky-soft", title: "Say it in Malayalam", note: "Same meaning, your language" },
  { id: "aloud", icon: "voice-mint-18", bg: "bg-mint-soft", title: "Read it aloud", note: "Evo's calm voice" },
  { id: "wrong", icon: "close-peach-18", bg: "bg-peach-soft", title: "This isn't right for me", note: "Evo will adjust" },
];

const REACTIONS: { id: Reaction; icon: string; label: string }[] = [
  { id: "heart", icon: "heart-peach-18", label: "This helped me feel heard" },
  { id: "star", icon: "star-sun-18", label: "Keep this" },
  { id: "helpful", icon: "check-limedeep-18", label: "Helpful" },
];

/** X7 · long-press on an Evo message: scrim, lifted message, reactions, action sheet. */
export function MessageActions({ text, top, reaction, onReact, onAction, onClose }: { text: string; top: number; reaction?: Reaction; onReact: (r: Reaction) => void; onAction: (a: MessageAction) => void; onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sheet.current?.querySelector("button")?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Message actions" className="fixed inset-0 z-50">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[rgba(21,26,19,0.28)] evo-enter-fade" />
      <div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col px-6 pb-7">
        <div className="flex flex-col gap-3" style={{ marginTop: Math.max(110, Math.min(top, 420)) }}>
          <div className="flex w-full items-start gap-2.5 rounded-[22px] bg-surface p-3.5 shadow-[0_20px_40px_rgba(21,26,19,0.2)]">
            <Orb size={24} />
            <p className="flex-1 type-body-m text-t1">{text}</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full bg-surface p-2 shadow-[0_12px_28px_rgba(21,26,19,0.15)]">
            {REACTIONS.map((r) => (
              <button key={r.id} type="button" aria-label={r.label} aria-pressed={reaction === r.id} onClick={() => onReact(r.id)} className={cn("flex size-10 cursor-pointer items-center justify-center rounded-[20px]", reaction === r.id ? "bg-lime-soft" : "bg-subtle")}>
                <FigmaIcon name={r.icon} size={18} />
              </button>
            ))}
            <p className="pr-2 pl-2 type-body-s text-t2">Helpful?</p>
          </div>
        </div>
        <div className="flex-1" />
        <div ref={sheet} className="flex w-full flex-col gap-0.5 rounded-[28px] bg-surface p-2.5 shadow-[0_-10px_40px_rgba(21,26,19,0.2)] evo-enter-fade">
          {ACTIONS.map((a) => (
            <button key={a.id} type="button" onClick={() => onAction(a.id)} className="flex w-full cursor-pointer items-center gap-3 rounded-[16px] px-2.5 py-[9px] text-left hover:bg-subtle focus-visible:bg-subtle">
              <span className={cn("flex size-[34px] items-center justify-center rounded-[11px]", a.bg)}>
                <FigmaIcon name={a.icon} size={18} />
              </span>
              <span className="flex flex-1 flex-col gap-px">
                <span className="type-label-m text-t1">{a.title}</span>
                <span className="type-caption text-t3">{a.note}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
