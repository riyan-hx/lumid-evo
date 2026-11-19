"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { type Ladder, loadLadder, saveLadder } from "@/lib/ladder";

const MOMENTS = [
  { label: "After dinner", icon: "coffee-limedeep-17", bg: "bg-surface", off: "bg-sun-soft", offIcon: "coffee-sun-19" },
  { label: "On the bus home", icon: "path-sun-17", bg: "bg-sun-soft" },
  { label: "After my shower", icon: "leaf-sun-17", bg: "bg-sun-soft" },
  { label: "When I wake up", icon: "sunrise-sun-17", bg: "bg-sun-soft" },
];

/** "Open Riya's chat and type "hey"" → "open Riya's chat and type hey". */
const inline = (t: string) => t[0].toLowerCase() + t.slice(1).replace(/"/g, "");

/** 7.3 · If–then moment — Figma node 125:2321 */
export default function Moment() {
  const router = useRouter();
  const toast = useToast();
  const [l, setL] = useState<Ladder | null>(null);
  const [moment, setMoment] = useState("After dinner");
  const [song, setSong] = useState(false);
  useEffect(() => {
    const saved = loadLadder();
    if (!saved) return router.replace("/ladder/build");
    setL(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    if (saved.moment) setMoment(saved.moment);
    setSong(!!saved.song);
  }, [router]);

  if (!l) return <FigmaScreen mood="warm">{null}</FigmaScreen>;
  const rung = l.rungs[l.current];

  return (
    <FigmaScreen gap={12} mood="warm">
      <FlowHeader icon="chevron-left" label="Back" title="Pick a moment" sub="Not a clock time" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">When will you do it?</h1>
      <p className="type-body-m text-t2">Tie it to something you already do.</p>
      <div role="radiogroup" aria-label="Moment" className="grid w-full grid-cols-2 gap-2.5">
        {MOMENTS.map((m) => {
          const on = moment === m.label;
          return (
            <button key={m.label} type="button" role="radio" aria-checked={on} onClick={() => setMoment(m.label)} className={cn("flex cursor-pointer items-center gap-2.5 rounded-[18px] p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78")}>
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[11px]", on ? "bg-surface" : "bg-sun-soft")}>
                <FigmaIcon name={m.label === "After dinner" ? (on ? "coffee-limedeep-17" : "coffee-sun-19") : m.icon} size={17} />
              </span>
              <span className="flex-1 type-label-m text-t1">{m.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex w-full flex-col gap-2.5 rounded-[24px] p-[18px] shadow-[0_14px_28px_-10px_rgba(21,26,19,0.25)]" style={{ backgroundImage: "linear-gradient(159.35deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <div className="flex items-center">
          <p className="flex-1 type-label-s text-lime">YOUR PLAN, IN ONE LINE</p>
          <span className="flex size-7 items-center justify-center rounded-[9px] bg-white/12">
            <FigmaIcon name="target-forest-15" size={15} />
          </span>
        </div>
        <p className="type-title-l text-white" aria-live="polite">
          &quot;{moment}, I&apos;ll {inline(rung.text)}.&quot;
        </p>
      </div>
      <button type="button" role="switch" aria-checked={song} onClick={() => setSong(!song)} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[18px] border p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", song ? "border-lime bg-lime-soft" : "border-white bg-white/78")}>
        <span className="flex size-[34px] items-center justify-center rounded-[11px] bg-lavender-soft">
          <FigmaIcon name="music-lav-18" size={18} />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="type-label-m text-t1">Pair it with a song you love</span>
          <span className="type-caption text-t3">Only while you do this step</span>
        </span>
        {song && <FigmaIcon name="check-limedeep-20" size={20} />}
      </button>
      <Grow />
      <Pill
        label="Set my moment"
        className="w-full"
        onClick={() => {
          saveLadder({ ...l, moment, song });
          toast.show(`Set for ${moment.toLowerCase()}`);
          router.push("/ladder");
        }}
      />
    </FigmaScreen>
  );
}
