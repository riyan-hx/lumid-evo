"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Hotline, RoundButton, SupportRow } from "@/components/safety/parts";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { safety, trusted } from "@/lib/safety";

/** 8.3 · Safety moment — Figma node 126:2496. Everything else pauses; Evo stays. */
function Moment() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q");
  const chat = params.get("chat");
  const [safe, setSafe] = useState(false);
  const [who, setWho] = useState<string | null>(null);
  useEffect(() => {
    safety.pause();
    setWho(trusted.get()?.name ?? null); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);

  return (
    <FigmaScreen gap={14} mood="warm">
      <div className="flex w-full items-center gap-2.5">
        <RoundButton icon="chevron-left" label="Back" onClick={() => router.back()} />
        <Orb size={34} />
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-t1">Evo</p>
          <p className="type-caption text-t3">Pausing everything else</p>
        </div>
      </div>
      {q && (
        <div className="flex w-full justify-end">
          <p className="max-w-[300px] rounded-[22px] px-4 py-[11px] type-label-m text-white" style={{ backgroundImage: "var(--gradient-forest)" }}>
            {q}
          </p>
        </div>
      )}
      <div className="flex w-full flex-col gap-3 rounded-[28px] bg-surface p-5 shadow-[0_18px_40px_-12px_rgba(21,26,19,0.14)]" aria-live="polite">
        <h1 className="type-title-l text-forest">{safe ? "Thank you. I'm staying close tonight." : "Thank you for telling me. I'm really glad you did."}</h1>
        <p className="type-body-l text-t1">{safe ? "If that changes, even a little, the people below are a tap away." : "Are you safe right now?"}</p>
        {!safe ? (
          <div className="flex w-full gap-2">
            <Pill label="I'm not sure" icon={null} className="flex-1" onClick={() => router.push("/crisis")} />
            <Pill label="I'm safe" variant="glass" icon={null} className="flex-1" onClick={() => setSafe(true)} />
          </div>
        ) : (
          <div className="flex w-full gap-2">
            <Pill label="Keep talking" icon={null} className="flex-1" onClick={() => router.push(chat ? `/chat/live?id=${chat}` : "/chat/live?mode=listen")} />
            <Pill label="My safety plan" variant="glass" icon={null} className="flex-1" onClick={() => router.push("/safety")} />
          </div>
        )}
      </div>
      <SupportRow href="tel:14416" icon="phone-peach-21" bg="bg-peach-soft" title="Call Tele-MANAS" note="Free, 24×7, in Malayalam" trailing={<Hotline>14416</Hotline>} />
      <SupportRow href="/safety/reach-out" icon="users-lav-21" bg="bg-lavender-soft" title="Message someone I trust" note={who ? `Your ready message to ${who}` : "Set up a ready message"} />
      <Grow />
      <p className="text-center type-caption text-peach-text">Evo stays with you. Suggestions are paused for 24 hours.</p>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Moment />
    </Suspense>
  );
}
