"use client";

import { BackRow, Body, FigmaIcon, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { useProfile } from "@/lib/profile";

const CONCERNS = [
  { label: "Anxious or on edge", icon: "cloud-sky", bg: "bg-sky-soft" },
  { label: "Low or empty", icon: "moon-lav", bg: "bg-lavender-soft" },
  { label: "Overwhelmed", icon: "brain-sun", bg: "bg-sun-soft" },
  { label: "Stuck, can't start", icon: "path-limedeep", bg: "bg-lime-soft" },
  { label: "Lonely", icon: "users-peach", bg: "bg-peach-soft" },
  { label: "Can't sleep", icon: "moon-sky", bg: "bg-sky-soft" },
  { label: "Angry or irritable", icon: "zap-peach", bg: "bg-peach-soft" },
  { label: "Relationships", icon: "heart-lav", bg: "bg-lavender-soft" },
];

/** 1.6 · What's been weighing on you — Figma node 113:1368 */
export default function Weighing() {
  const { profile, update } = useProfile();
  const toggle = (c: string) =>
    update({ concerns: profile.concerns.includes(c) ? profile.concerns.filter((x) => x !== c) : [...profile.concerns, c] });

  return (
    <FigmaScreen gap={14} mood="calm">
      <BackRow href="/age" />
      <Title>What&apos;s been weighing on you?</Title>
      <Body>Pick any that fit. Evo uses this to choose which tools to offer first.</Body>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {CONCERNS.map((c) => {
          const on = profile.concerns.includes(c.label);
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(c.label)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2.5 rounded-[20px] p-3.5 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
                on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78",
              )}
            >
              {/* Figma row is 100 px tall (icon tile + spacer + check) */}
              <span className="flex h-[100px] w-full items-center">
                <Tile size={34} radius={11} bg={c.bg}>
                  <FigmaIcon name={c.icon} size={18} />
                </Tile>
                <span className="flex-1" />
                {on && <FigmaIcon name="check-limedeep-18" size={18} />}
              </span>
              <span className="type-label-m text-t1">{c.label}</span>
            </button>
          );
        })}
      </div>
      <Grow />
      <Pill label="Continue" href="/privacy" className="w-full" />
    </FigmaScreen>
  );
}
