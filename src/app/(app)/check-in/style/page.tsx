"use client";

import { useRouter } from "next/navigation";
import { FigmaIcon, FlowHeader, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { cn } from "@/lib/cn";
import { STYLE_HREF, useProfile, type CheckinStyle } from "@/lib/profile";

const STYLES: { id: CheckinStyle; icon: string; bg: string; title: string; note: string; time: string }[] = [
  { id: "quick", icon: "zap-sun-19", bg: "bg-sun-soft", title: "Quick", note: "One tap from your lock screen", time: "3 sec" },
  { id: "meter", icon: "target-lav", bg: "bg-lavender-soft", title: "Mood meter", note: "Energy × pleasantness grid", time: "5 sec" },
  { id: "wheel", icon: "heart-peach-19", bg: "bg-peach-soft", title: "Feelings wheel", note: "From big feeling to the exact word", time: "10 sec" },
  { id: "voice", icon: "voice-sky", bg: "bg-sky-soft", title: "Say it", note: "Speak; Evo finds the feelings", time: "15 sec" },
  { id: "body", icon: "battery-mint", bg: "bg-mint-soft", title: "Body needs", note: "Hungry, angry, lonely, tired?", time: "8 sec" },
  { id: "classic", icon: "cloud-limedeep", bg: "bg-lime-soft", title: "Feelings first", note: "The classic eight + energy", time: "10 sec" },
];

/** C1 · Choose your check-in — Figma node 134:2767 */
export default function CheckInStyle() {
  const router = useRouter();
  const { profile, update } = useProfile();
  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader solid icon="chevron-left" label="Back" title="Check-in style" sub="Change any time" onClick={() => router.back()} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">How do you like to check in?</h1>
      <p className="type-body-m text-t2">Pick a default. Evo may suggest another when it fits the moment.</p>
      <div role="radiogroup" aria-label="Check-in style" className="contents">
        {STYLES.map((s) => {
          const on = profile.checkinStyle === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                update({ checkinStyle: s.id });
                router.push(STYLE_HREF[s.id]);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-[18px] p-[11px] text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
                on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-surface",
              )}
            >
              <Tile size={36} radius={12} bg={s.bg}>
                <FigmaIcon name={s.icon} size={19} />
              </Tile>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{s.title}</span>
                <span className="type-caption text-t3">{s.note}</span>
              </span>
              <span className={cn("type-caption", on ? "text-lime-deep" : "text-t3")}>{s.time}</span>
              {on && <FigmaIcon name="check-limedeep-18" size={18} />}
            </button>
          );
        })}
      </div>
    </FigmaScreen>
  );
}
