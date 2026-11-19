"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { useCheckIns, type CheckIn } from "@/lib/checkins";
import { cn } from "@/lib/cn";
import { FEELINGS } from "@/lib/feelings";

const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const PLEASANT = new Set(["Calm", "Okay"]);
const BAR_MAX = 70; // tallest bar in the Figma chart
const card = "flex w-full rounded-[22px] border border-white bg-surface shadow-[0_10px_26px_rgba(21,26,19,0.07)]";

/** Mini mood meter (92×92): quadrant colours from the Figma asset, one dot per check-in. */
function MiniMeter({ items }: { items: CheckIn[] }) {
  return (
    <svg width={92} height={92} viewBox="0 0 92 92" role="img" aria-label={`${items.length} check-ins on the mood meter`} className="shrink-0">
      <defs>
        <clipPath id="mm">
          <rect width="92" height="92" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#mm)">
        <rect width="46" height="46" fill="#FFE4D6" />
        <rect x="46" width="46" height="46" fill="#FFEFC7" />
        <rect y="46" width="46" height="46" fill="#DCEBFF" />
        <rect x="46" y="46" width="46" height="46" fill="#D9F5E6" />
      </g>
      {items.map((c, i) => {
        const pleasant = PLEASANT.has(c.feeling);
        const energy = c.energy ?? (c.intensity >= 60 ? 3 : 1);
        // deterministic jitter so dots don't stack
        const jx = ((i * 37) % 26) + 6;
        const jy = ((i * 53) % 26) + 6;
        return <circle key={c.id} cx={(pleasant ? 46 : 0) + jx + 4} cy={(energy >= 2 ? 0 : 46) + jy + 4} r={4} fill="#242E21" />;
      })}
    </svg>
  );
}

/** C12 · Your week in feelings — Figma node 136:3087 */
export default function WeekInFeelings() {
  const router = useRouter();
  const toast = useToast();
  const { items } = useCheckIns();
  const [now] = useState(() => new Date());
  const [brief, setBrief] = useState(false);
  const [plan, setPlan] = useState<"yes" | "no" | null>(null);

  // Monday → Sunday of the current week
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 864e5));
  const week = items.filter((c) => new Date(c.at) >= monday);
  const perDay = days.map((d) => {
    const xs = week.filter((c) => new Date(c.at).toDateString() === d.toDateString());
    if (!xs.length) return null;
    const top = xs.reduce((a, c) => (c.intensity > a.intensity ? c : a));
    return { intensity: Math.round(xs.reduce((a, c) => a + c.intensity, 0) / xs.length), feeling: top.feeling };
  });
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
  const range = `${days[0].getDate()}–${fmt.format(days[6])}`;

  // Trend line from the person's data: first half vs second half of the week.
  const early = week.filter((c) => new Date(c.at).getDay() >= 1 && new Date(c.at).getDay() <= 3);
  const late = week.filter((c) => [4, 5, 6, 0].includes(new Date(c.at).getDay()));
  const avg = (xs: CheckIn[]) => (xs.length ? xs.reduce((a, c) => a + c.intensity, 0) / xs.length : null);
  const e = avg(early);
  const l = avg(late);
  const trend = e !== null && l !== null ? (l < e - 8 ? "Heavier early in the week, calmer later." : l > e + 8 ? "The week got heavier towards the end." : "A fairly steady week.") : "Not enough check-ins yet for a trend.";
  const hardest = perDay.reduce<{ i: number; v: number }>((a, d, i) => (d && d.intensity > a.v ? { i, v: d.intensity } : a), { i: -1, v: 0 });
  const dayName = (i: number) => new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(days[i]);

  return (
    <FigmaScreen gap={10} className="pb-[110px]">
      <div className="flex w-full flex-col gap-px">
        <p className="type-label-m text-t1">Your week in feelings</p>
        <p className="type-caption text-t3">
          {range} · {week.length} check-ins
        </p>
      </div>
      <div className={cn(card, "flex-col gap-2.5 p-3.5")}>
        <div className="flex w-full gap-1.5">
          {perDay.map((d, i) => (
            <button key={i} type="button" onClick={() => router.push("/journal")} aria-label={d ? `${dayName(i)}: ${d.feeling} ${d.intensity}` : `${dayName(i)}: no check-in`} className="flex h-[110px] flex-1 cursor-pointer flex-col items-center justify-end gap-1.5">
              <span className={cn("w-6 rounded-[8px]", d ? (FEELINGS.find((f) => f.name === d.feeling)?.bg ?? "bg-lime-soft") : "bg-subtle")} style={{ height: d ? Math.max(10, Math.round((d.intensity / 100) * BAR_MAX)) : 6 }} />
              <span className="type-caption text-t3">{DOW[i]}</span>
            </button>
          ))}
        </div>
        <p className="type-caption text-t3">Bar height = how intense · colour = main feeling</p>
      </div>
      <div className={cn(card, "items-center gap-3 p-3.5")}>
        <MiniMeter items={week} />
        <div className="flex flex-1 flex-col gap-1">
          <p className="type-label-m text-t1">{trend}</p>
          <p className="type-caption text-t3">Each dot is one check-in: up = more energy, right = more pleasant.</p>
        </div>
      </div>
      {hardest.i >= 0 && (
        <div className={cn(card, "items-center gap-3 rounded-[18px] p-3")}>
          <Tile size={32} radius={11} bg="bg-lime-soft">
            <FigmaIcon name="leaf-limedeep-17" size={17} />
          </Tile>
          <p className="flex-1 type-body-s text-t1">Hardest day: {dayName(hardest.i)}</p>
        </div>
      )}
      <div className={cn(card, "items-center gap-3 rounded-[18px] p-3")}>
        <Tile size={32} radius={11} bg="bg-lavender-soft">
          <FigmaIcon name="calendar-lav-17" size={17} />
        </Tile>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="type-label-m text-t1">Add to my session brief</p>
          <p className="type-caption text-t3">Only if you choose · your psychologist</p>
        </div>
        <button type="button" role="switch" aria-checked={brief} aria-label="Add to my session brief" onClick={() => setBrief(!brief)} className={cn("flex h-[26px] w-11 cursor-pointer items-center rounded-[13px] p-[3px]", brief ? "justify-end bg-lime-deep" : "justify-start bg-line-strong")}>
          <span className="size-5 rounded-[10px] bg-surface" />
        </button>
      </div>
      {hardest.i >= 0 && plan !== "no" && (
        <div className="flex w-full flex-col gap-2 rounded-[22px] bg-lime-soft p-4">
          <p className="type-label-s text-lime-deep">FOR NEXT WEEK</p>
          <p className="type-body-m text-forest">{dayName(hardest.i)}s were hardest. Want a 2-minute wind-down set for that evening?</p>
          <div className="flex gap-2">
            <SoftChip label="Set it up" selected={plan === "yes"} onClick={() => { setPlan("yes"); toast.show(`Wind-down set for ${dayName(hardest.i)}s`); }} />
            <SoftChip label="Not now" onClick={() => setPlan("no")} />
          </div>
        </div>
      )}
    </FigmaScreen>
  );
}
