"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadioDot } from "@/components/chat/parts";
import { FigmaIcon, FlowHeader, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { type ChatLanguage, type ChatTone, type ReplyLength, useProfile } from "@/lib/profile";

const TONES: { id: ChatTone; icon: string; bg: string; title: string; note: string }[] = [
  { id: "warm", icon: "heart-peach-19", bg: "bg-peach-soft", title: "Warm & gentle", note: "Soft words, more reflection" },
  { id: "direct", icon: "target-sun-19", bg: "bg-sun-soft", title: "Straight to the point", note: "Fewer words, clear next steps" },
  { id: "listen", icon: "chat-lav-19", bg: "bg-lavender-soft", title: "Mostly listening", note: "Questions only when you want" },
];
const LENGTHS: { id: ReplyLength; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "medium", label: "Medium" },
  { id: "detailed", label: "Detailed" },
];
const LANGUAGES: ChatLanguage[] = ["English", "Malayalam", "Mix of both"];

const PREVIEW: Record<ChatTone, string> = {
  warm: "That sounds exhausting. Want to look at it together, or just get it out first?",
  direct: "That's a lot. Let's pick one thing to tackle first.",
  listen: "That sounds exhausting. I'm here — tell me more.",
};
const MORE: Record<ReplyLength, string> = { short: "", medium: " It makes sense you're worn down.", detailed: " It makes sense you'd feel worn down after a day like that — anyone would." };

/** X2 · How Evo talks to you — Figma node 141:3997 */
export default function ChatStyle() {
  const router = useRouter();
  const toast = useToast();
  const { profile, update } = useProfile();
  const [draft, setDraft] = useState<{ tone?: ChatTone; length?: ReplyLength; language?: ChatLanguage }>({});
  const tone = draft.tone ?? profile.chatTone;
  const length = draft.length ?? profile.replyLength;
  const language = draft.language ?? profile.chatLanguage;

  function save() {
    update({ chatTone: tone, replyLength: length, chatLanguage: language });
    toast.show("Evo's style saved");
    router.back();
  }

  return (
    <FigmaScreen gap={14} mood="calm">
      <FlowHeader solid icon="chevron-left" label="Back" title="Evo's style" sub="Change any time, even mid-chat" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">How should Evo talk with you?</h1>
      <div role="radiogroup" aria-label="Evo's style" className="flex w-full flex-col gap-3.5">
        {TONES.map((t) => {
          const on = tone === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setDraft((d) => ({ ...d, tone: t.id }))}
              className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[18px] border p-3 text-left backdrop-blur-[12px]", on ? "border-lime bg-lime-soft" : "border-white bg-surface")}
            >
              <span className={cn("flex size-9 items-center justify-center rounded-[12px]", t.bg)}>
                <FigmaIcon name={t.icon} size={19} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{t.title}</span>
                <span className="type-caption text-t3">{t.note}</span>
              </span>
              <RadioDot on={on} />
            </button>
          );
        })}
      </div>
      <SectionLabel>REPLY LENGTH</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {LENGTHS.map((l) => (
          <SoftChip key={l.id} label={l.label} selected={length === l.id} onClick={() => setDraft((d) => ({ ...d, length: l.id }))} />
        ))}
      </div>
      <SectionLabel>LANGUAGE</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((l) => (
          <SoftChip key={l} label={l} selected={language === l} onClick={() => setDraft((d) => ({ ...d, language: l }))} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <p className="type-label-s text-lime-deep">PREVIEW</p>
        <div className="flex items-start gap-2.5">
          <Orb size={22} />
          <p className="flex-1 type-body-m text-t1" aria-live="polite">
            {PREVIEW[tone]}
            {MORE[length]}
          </p>
        </div>
      </div>
      <Grow />
      <Pill label="Save my style" className="w-full" onClick={save} />
    </FigmaScreen>
  );
}
