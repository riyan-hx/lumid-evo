"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CARD, OHeader } from "@/components/discover/parts";
import { FigmaIcon, SectionLabel, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { cn } from "@/lib/cn";
import { dearMan, letters, uid } from "@/lib/discover";

const ROW = "flex w-full cursor-pointer items-center gap-3 rounded-[18px] p-3 text-left";

/** O4 · Unsent letter — Figma node 146:4646. Write it all, then choose: let it go, keep it locked, or turn it into a real message. */
export default function UnsentLetter() {
  const router = useRouter();
  const toast = useToast();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [fading, setFading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const ready = words > 3;

  const choice = (icon: string, bg: string, title: string, note: string, onClick: () => void, on?: boolean) => (
    <button type="button" disabled={!ready} onClick={onClick} className={cn(ROW, on ? "border border-lime bg-lime-soft" : "border border-white bg-white/85", "disabled:cursor-not-allowed disabled:opacity-60")}>
      <Tile size={36} radius={12} bg={bg}>
        <FigmaIcon name={icon} size={19} />
      </Tile>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label-m text-t1">{title}</span>
        <span className="type-caption text-t3">{note}</span>
      </span>
      <FigmaIcon name="chevron-right" size={18} />
    </button>
  );

  return (
    <FigmaScreen gap={12}>
      <OHeader icon="close" label="Close" title="Unsent letter" sub={`To: ${to.trim() || "someone"} · nobody sees this`} onClick={() => router.back()} />
      <div className={cn("flex w-full flex-col gap-2.5 rounded-[24px] border border-line-strong bg-surface p-[18px] shadow-[0_12px_28px_rgba(21,26,19,0.08)]", fading && "evo-fade-away")}>
        <label className="flex items-baseline">
          <span className="sr-only">Who it&apos;s to</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Who is it to?" className="min-w-[2ch] max-w-full bg-transparent [field-sizing:content] type-title-l text-t1 outline-none placeholder:text-t3" />
          {to.trim() && <span className="type-title-l text-t1">,</span>}
        </label>
        <textarea aria-label="Your letter" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say everything. Nobody will read this unless you choose." className="w-full resize-none [field-sizing:content] bg-transparent type-body-m text-t2 outline-none placeholder:text-t3" />
        <p className="type-caption text-t3">
          {words} {words === 1 ? "word" : "words"} · {Math.max(1, Math.round(words / 35))} min
        </p>
      </div>
      <SectionLabel>NOW, WHAT DO YOU WANT TO DO WITH IT?</SectionLabel>
      {choice("flower-peach-19", "bg-peach-soft", "Let it go", "Watch it fade, petal by petal", () => {
        setFading(true);
        setTimeout(() => {
          toast.show("Let go. It's gone.");
          router.push("/discover");
        }, 2400);
      })}
      {choice("archive-sky-19", "bg-sky-soft", "Keep it, locked", "Only you can open it", () => {
        letters.add({ id: uid(), at: new Date().toISOString(), to: to.trim(), text });
        toast.show("Kept on this phone. Only you can open it.");
        router.push("/discover");
      })}
      {choice("chat-limedeep-19", "bg-surface", "Turn it into a real message", "Evo helps — calm, clear, kind", () => setDraft(dearMan(to, text)), true)}
      {draft && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(draft.replace(/^"|"$/g, ""));
            toast.show("Copied. Edit it however you like.");
          }}
          className={cn("flex w-full cursor-pointer flex-col items-start gap-2 p-3.5 text-left", CARD)}
        >
          <span className="type-label-s text-lime-deep">DRAFT · DEAR MAN</span>
          <span className="type-body-m text-t1">{draft}</span>
          <span className="flex gap-1.5">
            <span className="rounded-full bg-mint-soft px-2 py-[3px] type-caption text-mint-text">✓ Calm</span>
            <span className="rounded-full bg-sky-soft px-2 py-[3px] type-caption text-sky-text">✓ Clear</span>
            <span className="rounded-full bg-lavender-soft px-2 py-[3px] type-caption text-lavender-text">✓ Kind</span>
          </span>
        </button>
      )}
      <Grow />
    </FigmaScreen>
  );
}
