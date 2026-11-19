"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FigmaToggle, FlowHeader, RowCard, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { useCheckIns, type CheckIn } from "@/lib/checkins";
import { useProfile } from "@/lib/profile";

const SLOTS = [
  { k: "Morn", from: 5, to: 11 },
  { k: "Noon", from: 11, to: 14 },
  { k: "Aft", from: 14, to: 18 },
  { k: "Eve", from: 18, to: 22 },
  { k: "Night", from: 22, to: 29 },
];
const MIN = 10;
const MAX_BAR = 79; // tallest bar in the Figma chart

const confidence = (n: number) => (n >= 30 ? "High confidence" : n >= 15 ? "Medium confidence" : "Low confidence — tell Evo if this is wrong");

function insights(items: CheckIn[]) {
  const out: { icon: string; bg: string; text: string; note: string }[] = [];
  const causes = new Map<string, number>();
  items.forEach((c) => c.causes?.forEach((x) => causes.set(x, (causes.get(x) ?? 0) + 1)));
  const topCause = [...causes.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCause && topCause[1] >= 3) out.push({ icon: "users-peach-18", bg: "bg-peach-soft", text: `${topCause[0]} comes up most when you check in.`, note: confidence(topCause[1] * 3) });
  const feelings = new Map<string, number>();
  items.forEach((c) => feelings.set(c.feeling, (feelings.get(c.feeling) ?? 0) + 1));
  const topFeeling = [...feelings.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topFeeling) out.push({ icon: "moon-lav-18", bg: "bg-lavender-soft", text: `${topFeeling[0]} is your most frequent feeling lately.`, note: confidence(items.length) });
  return out;
}

/** 2.8 · Patterns — Figma node 115:1919 */
export default function Patterns() {
  const router = useRouter();
  const toast = useToast();
  const { profile, update } = useProfile();
  const { items } = useCheckIns();
  const [hidden, setHidden] = useState(false);

  const anxious = items.filter((c) => c.feeling === "Anxious");
  const avg = SLOTS.map((s) => {
    const xs = anxious.filter((c) => {
      const h = new Date(c.at).getHours();
      const hh = h < 5 ? h + 24 : h;
      return hh >= s.from && hh < s.to;
    });
    return { ...s, v: xs.length ? xs.reduce((a, c) => a + c.intensity, 0) / xs.length : 0 };
  });
  const top = Math.max(...avg.map((a) => a.v), 1);

  return (
    <FigmaScreen gap={12}>
      <FlowHeader icon="chevron-left" label="Back" title="What Evo notices" sub={`From ${items.length} check-ins`} onClick={() => router.back()} />
      {!profile.consents.learnPatterns ? (
        <RowCard icon="brain-lav-19" tileBg="bg-lavender-soft" title="Learn my patterns" note="Off — Evo isn't looking for patterns">
          <FigmaToggle on={false} onChange={(v) => update({ consents: { ...profile.consents, learnPatterns: v } })} label="Learn my patterns" />
        </RowCard>
      ) : items.length < MIN ? (
        <p className="type-body-m text-t2">Patterns appear after {MIN} check-ins — {MIN - items.length} to go. No rush.</p>
      ) : (
        <>
          <div className="flex w-full flex-col gap-2.5 rounded-[22px] border border-white bg-white/78 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <p className="type-label-m text-t1">Anxiety by time of day</p>
            <div className="flex h-[110px] w-full items-end gap-2.5" role="img" aria-label={avg.map((a) => `${a.k} ${Math.round(a.v)}`).join(", ")}>
              {avg.map((a) => (
                <div key={a.k} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <div
                    className="w-7 rounded-[8px]"
                    style={{
                      height: Math.max(8, Math.round((a.v / top) * MAX_BAR)),
                      ...(a.v === top && a.v > 0 ? { backgroundImage: "linear-gradient(109.5deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : { background: "var(--color-lime-soft)" }),
                    }}
                  />
                  <p className="type-caption text-t3">{a.k}</p>
                </div>
              ))}
            </div>
          </div>
          {!hidden &&
            insights(items).map((i) => (
              <div key={i.text} className="flex w-full items-start gap-3 rounded-[18px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
                <Tile size={34} radius={11} bg={i.bg}>
                  <FigmaIcon name={i.icon} size={18} />
                </Tile>
                <div className="flex flex-1 flex-col gap-[3px]">
                  <p className="type-label-m text-t1">{i.text}</p>
                  <p className="type-caption text-t3">{i.note}</p>
                </div>
              </div>
            ))}
          <div className="flex w-full gap-2">
            <SoftChip
              label="Not right?"
              onClick={() => {
                setHidden(true);
                toast.show("Thanks — Evo will stop suggesting these", () => setHidden(false));
              }}
            />
            <SoftChip label="Plan a wind-down" selected onClick={() => router.push("/calm")} />
          </div>
        </>
      )}
      <p className="type-caption text-t3">Patterns, not a diagnosis.</p>
    </FigmaScreen>
  );
}
