"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { type Ladder, loadLadder, saveLadder } from "@/lib/ladder";

/** Days since the ladder was planned, in words ("four days"). */
const WORDS = ["", "a day", "two days", "three days", "four days", "five days", "six days", "a week"];

/** 7.1 · Two-minute start — Figma node 125:2173. With no ladder yet, Evo asks what feels too big (7.2). */
export default function TwoMinuteStart() {
  const router = useRouter();
  const toast = useToast();
  const { chats, ready } = useChats();
  const [now] = useState(() => Date.now());
  const [l, setL] = useState<Ladder | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    const saved = loadLadder();
    if (saved) return void setL(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    const pending = chats.find((c) => c.step && !c.step.done)?.step;
    router.replace(pending ? `/ladder/build?goal=${encodeURIComponent(pending.text)}` : "/ladder/build");
  }, [ready, chats, router]);

  if (!l) return <FigmaScreen mood="warm">{null}</FigmaScreen>;
  const rung = l.rungs[l.current];
  const days = l.plannedAt ? Math.floor((now - new Date(l.plannedAt).getTime()) / 864e5) : 0;
  const why = days > 0 ? `You've wanted to do this for ${WORDS[Math.min(days, 7)]}. You don't have to do more than that.` : "Just this one small piece. You don't have to do more than that.";

  return (
    <FigmaScreen gap={14} mood="warm">
      <FlowHeader icon="close" label="Close" title="Two-minute start" sub="Picked for your energy right now" onClick={() => router.push("/home")} />
      <Grow />
      <div className="flex w-full justify-center">
        <Orb size={120} />
      </div>
      <p className="text-center type-label-s text-lime-deep">JUST THIS</p>
      <h1 className="text-center type-flow-title text-forest">{rung.text}.</h1>
      <p className="text-center type-body-m text-t2">{why}</p>
      <div className="flex justify-center">
        <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-2">
          <FigmaIcon name="clock-limedeep-16" size={16} />
          <span className="type-label-s text-lime-deep">2 minutes</span>
        </span>
      </div>
      <Grow />
      <Pill label="Start · 2 min" className="w-full" onClick={() => router.push("/ladder/rate")} />
      <div className="flex w-full gap-2.5">
        <Pill label="Smaller" variant="glass" icon={null} className="flex-1" onClick={() => router.push("/ladder/build")} />
        <Pill
          label="Not now"
          variant="glass"
          icon={null}
          className="flex-1"
          onClick={() => {
            saveLadder({ ...l, plannedAt: l.plannedAt ?? new Date().toISOString() });
            toast.show("Okay. It'll be here when you're ready.");
            router.push("/home");
          }}
        />
      </div>
    </FigmaScreen>
  );
}
