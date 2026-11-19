"use client";

import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { ROW, TabHeader } from "@/components/you/parts";
import { type Done, loadLadder } from "@/lib/ladder";

const an = (n: number) => `${n === 8 || n === 11 ? "an" : "a"} ${n}`;

/** 7.7 · Your evidence — Figma node 125:2591. Proof from the person's own steps, never streaks. */
export default function Evidence() {
  const [h, setH] = useState<Done[] | null>(null);
  const [now] = useState(() => new Date());
  useEffect(() => setH(loadLadder()?.history ?? []), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  if (!h) return <FigmaScreen className="pb-[110px]">{null}</FigmaScreen>;

  const month = h.filter((d) => {
    const t = new Date(d.at);
    return t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
  });
  const last = h.slice(0, 5).reverse();
  const easier = h.find((d) => d.actual < d.expected);

  return (
    <FigmaScreen gap={12} className="pb-[110px]">
      <TabHeader title="Your evidence" sub={now.toLocaleDateString("en-GB", { month: "long" })} />
      <div
        className="flex w-full flex-col gap-1.5 rounded-[28px] border border-white p-[18px] shadow-[0_18px_40px_-12px_rgba(21,26,19,0.12)]"
        style={{ backgroundImage: "linear-gradient(161.12deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
      >
        <p className="type-label-s text-lime-deep">PROOF, NOT STREAKS</p>
        <div className="flex items-end gap-2.5">
          <p className="text-[64px] leading-[0.9] font-medium tracking-[-1.6px] text-forest">{month.length}</p>
          <p className="w-[150px] type-label-m font-medium text-t2">{month.length === 1 ? "hard thing" : "hard things"} you faced this month</p>
        </div>
      </div>
      {last.length > 0 ? (
        <div className="flex w-full flex-col gap-2.5 rounded-[22px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          <p className="type-label-m text-t1">Expected vs real, last {last.length} {last.length === 1 ? "step" : "steps"}</p>
          <div className="flex h-[90px] w-full items-end gap-3.5" role="img" aria-label={last.map((d) => `${d.text}: expected ${d.expected}, real ${d.actual}`).join("; ")}>
            {last.map((d) => (
              <div key={d.at} className="flex flex-1 items-end gap-[3px]">
                <div className="w-3 rounded-[4px] bg-peach-soft" style={{ height: d.expected * 9 }} />
                <div className="w-3 rounded-[4px]" style={{ height: Math.max(d.actual * 9, 3), backgroundImage: "linear-gradient(113.96deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 type-caption">
            <span className="text-peach-text">● expected</span>
            <span className="text-lime-deep">● real</span>
          </div>
        </div>
      ) : (
        <p className="type-body-m text-t2">Your first small step will show up here — with how hard you expected it to be, and how hard it really was.</p>
      )}
      {easier && (
        <div className={ROW}>
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[11px] bg-lavender-soft">
            <FigmaIcon name="quote-lav-18" size={18} />
          </span>
          <p className="flex-1 type-body-s text-t1">
            &quot;{easier.text}&quot; felt like {an(easier.expected)}. It was {an(easier.actual)}.
          </p>
        </div>
      )}
    </FigmaScreen>
  );
}
