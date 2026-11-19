"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FlowHeader, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { cn } from "@/lib/cn";

type Need = "Hungry" | "Angry" | "Lonely" | "Tired";
const NEEDS: { id: Need; icon: string; bg: string; note: string }[] = [
  { id: "Hungry", icon: "coffee-sun-23", bg: "bg-sun-soft", note: "Eat something small" },
  { id: "Angry", icon: "zap-peach-23", bg: "bg-peach-soft", note: "Move, then talk it out" },
  { id: "Lonely", icon: "users-lav-23", bg: "bg-lavender-soft", note: "Message one person" },
  { id: "Tired", icon: "moon-sky-23", bg: "bg-sky-soft", note: "Rest before deciding" },
];

/** Suggestion per combination (clinician-reviewable copy table). Order of keys = HALT order. */
const SUGGEST: Record<string, { text: string; actions: { label: string; href: string }[] }> = {
  Hungry: { text: "Something small to eat first — then see how you feel.", actions: [{ label: "Set a 10-min reminder", href: "/home" }, { label: "Check in after", href: "/check-in/style" }] },
  Angry: { text: "Move your body for two minutes, then talk it out.", actions: [{ label: "Calm the body", href: "/calm" }, { label: "Vent to Evo", href: "/chat?mode=listen" }] },
  Lonely: { text: "Send one message to someone who'd be glad to hear from you.", actions: [{ label: "Message someone", href: "/safety/reach-out" }, { label: "Talk to Evo", href: "/chat" }] },
  Tired: { text: "Rest before deciding anything big tonight.", actions: [{ label: "Wind down", href: "/calm" }, { label: "Park a worry", href: "/tools" }] },
  "Lonely+Tired": { text: "A short voice note to someone close, then an early night?", actions: [{ label: "Message someone", href: "/safety/reach-out" }, { label: "Wind down", href: "/calm" }] },
  "Hungry+Tired": { text: "Eat something simple, then an early night.", actions: [{ label: "Wind down", href: "/calm" }, { label: "Talk to Evo", href: "/chat" }] },
  "Angry+Tired": { text: "Tired makes anger louder. Breathe it down, sleep on it.", actions: [{ label: "Breathe", href: "/calm" }, { label: "Park it", href: "/tools" }] },
};
const pickSuggestion = (sel: Need[]) => {
  const key = NEEDS.map((n) => n.id).filter((n) => sel.includes(n)).join("+");
  return SUGGEST[key] ?? SUGGEST[sel[sel.length - 1]];
};

/** C6 · Body needs (HALT) — Figma node 135:2908 */
export default function BodyNeeds() {
  const router = useRouter();
  const { add } = useCheckIns();
  const [sel, setSel] = useState<Need[]>([]);
  const [action, setAction] = useState(0);
  const toggle = (n: Need) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const sug = sel.length ? pickSuggestion(sel) : null;

  function save() {
    if (!sel.length) return;
    add({ style: "body", feeling: sel.includes("Angry") ? "Angry" : sel.includes("Lonely") ? "Lonely" : "Okay", intensity: 40 + sel.length * 10, halt: sel });
    router.push(sug?.actions[action]?.href ?? "/home");
  }

  return (
    <FigmaScreen gap={12}>
      <FlowHeader solid icon="close" label="Close check-in" title="Check-in" sub="Body needs first" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">Before feelings — what does your body need?</h1>
      <p className="type-body-m text-t2">Many hard moments are really one of these.</p>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {NEEDS.map((n) => {
          const on = sel.includes(n.id);
          return (
            <button
              key={n.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(n.id)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2 rounded-[20px] p-3.5 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
                on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-surface",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Tile size={44} radius={15} bg={n.bg}>
                  <FigmaIcon name={n.icon} size={23} />
                </Tile>
                {on ? (
                  <span className="flex size-[22px] items-center justify-center rounded-[11px] bg-lime-deep">
                    <FigmaIcon name="check-white-14" size={14} />
                  </span>
                ) : (
                  <span className="size-[22px] rounded-[11px] border border-line-strong bg-surface" />
                )}
              </span>
              <span className="type-title-m text-t1">{n.id}</span>
              <span className="type-caption text-t3">{n.note}</span>
            </button>
          );
        })}
      </div>
      {sug && (
        <div
          className="flex w-full flex-col gap-2 rounded-[22px] border border-white p-4"
          style={{ backgroundImage: "linear-gradient(154.3deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
        >
          <p className="type-label-s text-lime-deep">{sel.join(" + ").toUpperCase()}</p>
          <p className="text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-forest">{sug.text}</p>
          <div className="flex gap-2">
            {sug.actions.map((a, i) => (
              <SoftChip key={a.label} label={a.label} selected={action === i} onClick={() => setAction(i)} />
            ))}
          </div>
        </div>
      )}
      <Grow />
      <Pill label="Save" className="w-full" onClick={save} />
    </FigmaScreen>
  );
}
