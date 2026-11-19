"use client";

import { useRouter } from "next/navigation";
import { BackRow, Body, FigmaIcon, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { useProfile, type AgeBand } from "@/lib/profile";

const OPTIONS: { band: AgeBand; label: string; note: string }[] = [
  { band: "u16", label: "Under 16", note: "A parent or guardian says okay first" },
  { band: "16-17", label: "16 – 17", note: "A parent or guardian says okay first" },
  { band: "18-24", label: "18 – 24", note: "Straight in" },
  { band: "25+", label: "25 or older", note: "Straight in" },
];

/** 1.4 · Age — Figma node 112:1488 */
export default function Age() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const teen = profile.ageBand === "u16" || profile.ageBand === "16-17";

  return (
    <FigmaScreen gap={14}>
      <BackRow href="/verify" />
      <Title>How old are you?</Title>
      <Body>One tap. It only decides how we keep you safe.</Body>
      <div role="radiogroup" aria-label="Age" className="contents">
        {OPTIONS.map((o) => {
          const on = profile.ageBand === o.band;
          return (
            <button
              key={o.band}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => update({ ageBand: o.band })}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-[20px] p-3.5 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
                on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78",
              )}
            >
              <Tile size={40} radius={13} bg={on ? "bg-lime" : "bg-lime-soft"}>
                <FigmaIcon name={on ? "users-forest" : "user-limedeep"} size={21} />
              </Tile>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-title-m text-t1">{o.label}</span>
                <span className="type-caption text-t3">{o.note}</span>
              </span>
              {on && <FigmaIcon name="check-limedeep" size={22} />}
            </button>
          );
        })}
      </div>
      <div className="flex w-full items-center gap-2.5 rounded-[16px] bg-peach-soft p-3">
        <FigmaIcon name="lifebuoy-peach" size={20} />
        <p className="flex-1 type-body-s text-peach-text">Crisis help is always open, whatever your age.</p>
      </div>
      <Grow />
      <Pill label="Continue" className="w-full" onClick={() => profile.ageBand && router.push(teen ? "/guardian" : "/onboarding/weighing")} />
    </FigmaScreen>
  );
}
