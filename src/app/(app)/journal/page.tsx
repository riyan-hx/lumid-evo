"use client";

import Link from "next/link";
import { useState } from "react";
import { FigmaIcon, GlassCard, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { useCheckIns, type CheckIn } from "@/lib/checkins";
import { cn } from "@/lib/cn";
import { FEELINGS } from "@/lib/feelings";

type Range = "Week" | "Month" | "Year";
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const ROW_ICON: Record<string, string> = { Anxious: "cloud-sky-19", Sad: "rain-lav-19" };
const tileOf = (feeling: string) => FEELINGS.find((f) => f.name === feeling)?.bg ?? "bg-lime-soft";
const iconOf = (feeling: string) => ROW_ICON[feeling] ?? FEELINGS.find((f) => f.name === feeling)?.icon ?? "heart-lav";
const dayKey = (d: Date) => d.toDateString();

/** Most intense check-in of each day decides that day's colour. */
function byDay(items: CheckIn[]) {
  const m = new Map<string, CheckIn>();
  for (const c of items) {
    const k = dayKey(new Date(c.at));
    const prev = m.get(k);
    if (!prev || c.intensity > prev.intensity) m.set(k, c);
  }
  return m;
}

/** 2.7 · Mood journal — Figma node 115:1759 */
export default function Journal() {
  const { items } = useCheckIns();
  const [range, setRange] = useState<Range>("Month");
  const [now] = useState(() => new Date());
  const days = byDay(items);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(now);

  // Month grid: weeks start Monday, like the design.
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const thisWeek = weeks.find((w) => w.includes(now.getDate())) ?? weeks[0];
  const shown = range === "Week" ? [thisWeek] : weeks;

  const weekAgo = now.getTime() - 7 * 864e5;
  const recent = items.filter((c) => new Date(c.at).getTime() >= weekAgo);
  const fmtDay = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
  const fmtTime = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <FigmaScreen gap={12} className="pb-[110px]">
      <div className="flex w-full items-center">
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-t1">Mood journal</p>
          <p className="type-caption text-t3">{month}</p>
        </div>
        <Link href="/insights" className="type-label-m text-lime-deep">
          Patterns
        </Link>
      </div>
      <div role="tablist" className="flex w-full gap-2">
        {(["Week", "Month", "Year"] as Range[]).map((r) => (
          <SoftChip key={r} label={r} selected={range === r} onClick={() => setRange(r)} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[22px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        {range === "Year" ? (
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }, (_, m) => {
              const has = items.some((c) => {
                const d = new Date(c.at);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
              });
              return (
                <div key={m} className={cn("flex h-[34px] items-center justify-center rounded-[12px] type-caption", has ? "bg-lime-soft text-t1" : "bg-subtle text-t3", m === now.getMonth() && "border-2 border-lime")}>
                  {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(2026, m, 1))}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="flex w-full">
              {DOW.map((d, i) => (
                <p key={i} className="flex-1 text-center type-caption text-t3">
                  {d}
                </p>
              ))}
            </div>
            {shown.map((w, wi) => (
              <div key={wi} className="flex w-full gap-1.5">
                {w.map((n, i) => {
                  if (!n) return <span key={i} className="h-[34px] flex-1" />;
                  const date = new Date(now.getFullYear(), now.getMonth(), n);
                  const c = days.get(dayKey(date));
                  const future = n > now.getDate();
                  const today = n === now.getDate();
                  return (
                    <div
                      key={i}
                      title={c ? `${c.feeling} ${c.intensity}` : undefined}
                      className={cn(
                        "flex h-[34px] flex-1 items-center justify-center rounded-[12px] type-caption",
                        c ? tileOf(c.feeling) : "bg-subtle",
                        future || !c ? "text-t3" : "text-t1",
                        today && "border-2 border-lime bg-lime-soft text-t1",
                      )}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
      <h2 className="type-title-m text-ink">This week</h2>
      {recent.length === 0 ? (
        <p className="type-body-s text-t2">Your check-ins will appear here.</p>
      ) : (
        recent.map((c) => {
          const d = new Date(c.at);
          return (
            <GlassCard key={c.id} className="rounded-[18px] p-3">
              <Tile size={36} radius={12} bg={tileOf(c.feeling)}>
                <FigmaIcon name={iconOf(c.feeling)} size={19} />
              </Tile>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="type-label-m text-t1">
                  {fmtDay.format(d)} · {c.feeling} {c.intensity}
                </p>
                <p className="type-caption text-t3">{c.causes?.length ? c.causes.join(" · ") : fmtTime.format(d).toUpperCase()}</p>
              </div>
              <FigmaIcon name="chevron-right" size={18} />
            </GlassCard>
          );
        })
      )}
    </FigmaScreen>
  );
}
