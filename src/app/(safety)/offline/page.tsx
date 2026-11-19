"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { NoteStrip } from "@/components/you/parts";
import { Orb } from "@/components/ui/orb";
import { useOnline } from "@/lib/use-online";

const TOOLS = [
  { href: "/calm/breathe", icon: "wind-sky-17", bg: "bg-sky-soft", text: "Breathe with me — 1 min" },
  { href: "/safety", icon: "heart-peach-17", bg: "bg-peach-soft", text: "My safety plan" },
  { href: "/crisis", icon: "lifebuoy-peach-17", bg: "bg-peach-soft", text: "Crisis support — calls work offline" },
];

/** 9.7 · Offline & Evo can't think — Figma node 130:2753. Words stay on the phone; tools that need no network stay open. */
function Offline() {
  const router = useRouter();
  const q = useSearchParams().get("q");
  const online = useOnline();
  return (
    <FigmaScreen gap={12} mood="calm">
      <div className="flex w-full items-center gap-2.5">
        <RoundButton icon="chevron-left" label="Back" onClick={() => router.back()} />
        <Orb size={34} />
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-t1">Evo</p>
          <p className="type-caption text-t3">{online ? "Back online" : "Offline · here with you"}</p>
        </div>
      </div>
      {/* Always rendered (hidden online) so its icon is already loaded when the connection drops. */}
      <div role="status" hidden={online} className="flex w-full items-center gap-2.5 rounded-[18px] p-3" style={{ backgroundImage: "var(--gradient-forest)" }}>
        <FigmaIcon name="wifioff-lime-20" size={20} />
        <p className="flex-1 type-body-s text-white">You&apos;re offline. Your words are safe on this phone.</p>
      </div>
      {q && (
        <>
          <div className="flex w-full justify-end">
            <p className="max-w-[300px] rounded-[22px] px-4 py-[11px] type-label-m text-white opacity-70" style={{ backgroundImage: "var(--gradient-forest)" }}>
              {q}
            </p>
          </div>
          <div className="flex w-full items-center justify-end gap-1.5">
            <FigmaIcon name="clock-t3-14" size={14} />
            <p className="type-caption text-t3">{online ? "Saved · ready to send" : "Saved · waiting to send"}</p>
          </div>
        </>
      )}
      <div className="flex w-full flex-col gap-2 rounded-[22px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <p className="type-label-m text-t1">While we wait, these work offline</p>
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="flex w-full items-center gap-3 rounded-[16px] bg-subtle p-2.5">
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-[11px] ${t.bg}`}>
              <FigmaIcon name={t.icon} size={17} />
            </span>
            <span className="flex-1 type-label-m text-t1">{t.text}</span>
            <FigmaIcon name="chevron-right-16" size={16} />
          </Link>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[20px] bg-sun-soft p-3.5">
        <p className="type-label-s text-sun-text">IF EVO IS SLOW OR CAN&apos;T THINK</p>
        <p className="type-body-s text-t1">&quot;I&apos;m having trouble thinking right now — but I&apos;m still here.&quot; Tap-first choices appear; nothing you typed is lost.</p>
      </div>
      <Grow />
      {online && q ? (
        <Link href={`/chat?text=${encodeURIComponent(q)}`} className="w-full">
          <NoteStrip icon="refresh-sky-16" tileBg="bg-sky-soft">
            Back online. Tap to send it to Evo now.
          </NoteStrip>
        </Link>
      ) : (
        <NoteStrip icon="refresh-sky-16" tileBg="bg-sky-soft">
          Back online, Evo asks before sending.
        </NoteStrip>
      )}
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Offline />
    </Suspense>
  );
}
