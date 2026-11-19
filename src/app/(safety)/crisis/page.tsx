"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Hotline, RoundButton, SupportRow } from "@/components/safety/parts";
import { Pill } from "@/components/ui/pill";
import { safety, trusted } from "@/lib/safety";

/** 8.4 · Crisis support — Figma node 126:2575. Static numbers: works offline. */
export default function Crisis() {
  const router = useRouter();
  const [who, setWho] = useState<string | null>(null);
  useEffect(() => {
    safety.pause();
    setWho(trusted.get()?.name ?? null); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);

  return (
    <FigmaScreen gap={12} mood="warm">
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="close" label="Close" onClick={() => router.back()} />
      </div>
      <h1 className="type-flow-title text-forest">You don&apos;t have to go through this alone.</h1>
      <span className="flex items-center gap-1.5 self-start rounded-full bg-surface px-2.5 py-1.5">
        <FigmaIcon name="wifioff-limedeep-14" size={14} />
        <span className="type-caption text-lime-deep">Works without internet</span>
      </span>
      <div className="flex w-full flex-col gap-1.5 rounded-[28px] bg-surface p-5 shadow-[0_18px_34px_-12px_rgba(21,26,19,0.14)]">
        <p className="type-label-s text-lime-deep">TELE-MANAS · GOVT. OF INDIA</p>
        <p className="text-[48px] leading-none font-medium tracking-[-1.2px] text-forest">14416</p>
        <p className="type-body-s text-t2">Free, confidential, 24×7 — Malayalam and many more</p>
        <Pill label="Call 14416" className="mt-1.5 w-full" href="tel:14416" />
      </div>
      <SupportRow href="tel:112" icon="alert-peach-21" bg="bg-peach-soft" title="In immediate danger" note="Emergency services" trailing={<Hotline>112</Hotline>} />
      <SupportRow href="/safety/reach-out" icon="users-lav-21" bg="bg-lavender-soft" title="Someone you trust" note={who ? `Send your ready message to ${who}` : "Set up a ready message"} />
      <Grow />
      <p className="text-center type-caption text-peach-text">Evo will pause suggestions and stay with you.</p>
    </FigmaScreen>
  );
}
