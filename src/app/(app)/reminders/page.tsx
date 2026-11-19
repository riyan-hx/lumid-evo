"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FigmaToggle, FlowHeader, RowCard } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { DEFAULT_REMINDERS, type Reminders, reminders } from "@/lib/reminders";
import { clock, WORRY_TIME } from "@/lib/tool-store";

/** 9.6 · Gentle reminders — Figma node 130:2660. Delivery arrives with push notifications (build step 15). */
export default function RemindersPage() {
  const router = useRouter();
  const [r, setR] = useState<Reminders>(DEFAULT_REMINDERS);
  useEffect(() => setR(reminders.get()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  const set = (k: keyof Reminders) => (v: boolean) =>
    setR((x) => {
      const next = { ...x, [k]: v };
      reminders.save(next);
      return next;
    });

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title="Reminders" sub="Tied to moments, never nagging" onClick={() => router.back()} />
      <RowCard icon="coffee-sun-19" tileBg="bg-sun-soft" title="After dinner" note="Evening check-in">
        <FigmaToggle on={r.afterDinner} onChange={set("afterDinner")} label="After dinner reminder" />
      </RowCard>
      <RowCard icon="moon-lav-19" tileBg="bg-lavender-soft" title="Before bed" note="Wind-down + three good things">
        <FigmaToggle on={r.beforeBed} onChange={set("beforeBed")} label="Before bed reminder" />
      </RowCard>
      <RowCard icon="parking-peach-19" tileBg="bg-peach-soft" title="Worry time" note={`${clock(WORRY_TIME)} PM · 10 minutes`}>
        <FigmaToggle on={r.worry} onChange={set("worry")} label="Worry time reminder" />
      </RowCard>
      <RowCard icon="eyeoff-sky-19" tileBg="bg-sky-soft" title="Discreet wording" note='Shows "Planner · time for your 2 minutes"'>
        <FigmaToggle on={r.discreet} onChange={set("discreet")} label="Discreet wording" />
      </RowCard>
      <div className="flex w-full flex-col gap-2.5 rounded-[22px] p-3.5" style={{ backgroundImage: "linear-gradient(155.53deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <p className="type-label-s text-lime">LOCK SCREEN PREVIEW</p>
        <div className="flex w-full flex-col gap-2.5 rounded-[18px] border border-white bg-white/12 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] bg-lime-soft">
              <FigmaIcon name="calendar-limedeep" size={16} />
            </span>
            <div className="flex flex-col gap-px">
              <p className="type-caption text-lime">{r.discreet ? "PLANNER" : "EVO"}</p>
              <p className="type-label-m text-white">{r.discreet ? "Time for your 2 minutes" : "Time for your 2-minute step"}</p>
            </div>
          </div>
          <div className="flex w-full gap-2">
            {["Done", "Smaller", "Later"].map((a) => (
              <span key={a} className="flex flex-1 justify-center rounded-[14px] bg-white/12 py-[9px] type-label-s text-white">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="type-caption text-t3">One gentle nudge a day at most. Ignored 3 times? Evo asks if the time is wrong — it never nags.</p>
    </FigmaScreen>
  );
}
