"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { type Ladder, loadLadder, saveLadder } from "@/lib/ladder";

/** 8.7 · Reset, not restart — Figma node 127:2588. The missed rung steps down one; nothing is lost. */
export default function Reset() {
  const router = useRouter();
  const [l, setL] = useState<Ladder | null>(null);
  useEffect(() => {
    const saved = loadLadder();
    if (!saved) return router.replace("/ladder");
    setL(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, [router]);
  if (!l) return <FigmaScreen>{null}</FigmaScreen>;

  const was = l.rungs[l.current];
  const smaller = l.rungs[Math.min(l.current + 1, l.rungs.length - 1)];
  const clear = (next: Partial<Ladder>) => saveLadder({ ...l, moment: undefined, momentAt: undefined, ...next });

  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="close" label="Close" onClick={() => router.push("/home")} />
      </div>
      <Orb size={90} className="self-center" />
      <h1 className="text-center type-flow-title text-forest">Lots of people get stuck right here.</h1>
      <p className="text-center type-body-m text-t2">Yesterday&apos;s step didn&apos;t happen. That&apos;s information, not failure.</p>
      <div className="flex w-full flex-col gap-2 rounded-[24px] border border-white bg-white/78 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <p className="type-label-s text-lime-deep">A SMALLER STEP</p>
        <div className="flex items-center gap-2 rounded-[14px] bg-subtle px-3 py-2.5">
          <span className="flex-1 type-body-s text-t3">{was.text}</span>
          <span className="rounded-full bg-surface px-2 py-0.5 type-caption text-t3">dread {was.dread}</span>
        </div>
        <div className="flex items-center gap-2 rounded-[14px] border border-lime bg-lime-soft px-3 py-3.5">
          <span className="flex-1 type-label-m text-forest">{smaller.text}</span>
          <span className="rounded-full bg-lime px-2 py-0.5 type-caption text-forest">dread {smaller.dread}</span>
        </div>
      </div>
      <Grow />
      <Pill
        label="Do the smaller one"
        className="w-full"
        onClick={() => {
          clear({ current: l.rungs.indexOf(smaller) });
          router.push("/ladder");
        }}
      />
      <div className="flex w-full gap-2.5">
        <Pill
          label="New moment"
          variant="glass"
          icon={null}
          className="flex-1"
          onClick={() => {
            clear({});
            router.push("/ladder/moment");
          }}
        />
        <Pill
          label="Let it go"
          variant="glass"
          icon={null}
          className="flex-1"
          onClick={() => {
            clear({});
            router.push("/home");
          }}
        />
      </div>
    </FigmaScreen>
  );
}
