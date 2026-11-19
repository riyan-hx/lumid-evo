"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";

const TOOLS = [
  { href: "/calm/breathe", title: "Slow my breathing", note: "Cyclic sighing · 1 min", icon: "wind-sky-20", bg: "bg-sky-soft", tag: "Breathing" },
  { href: "/calm/ground", title: "Come back to the room", note: "5-4-3-2-1 grounding · 2 min", icon: "leaf-mint-20", bg: "bg-mint-soft", tag: "CBT" },
  { href: "/calm/relax", title: "Let go of tension", note: "Muscle relaxation · 5 min", icon: "body-lav-20", bg: "bg-lavender-soft", tag: "PMR" },
  { href: "/calm/tipp", title: "It's too much right now", note: "TIPP · 3 min", icon: "zap-peach-20", bg: "bg-peach-soft", tag: "DBT" },
  { href: "/calm/wind-down", title: "Wind down for sleep", note: "Night routine · 10 min", icon: "moon-sun-20", bg: "bg-sun-soft", tag: "CBT-I" },
];
/** Older links (/calm?tool=…) from chat and tools land on the right exercise. */
const ALIAS: Record<string, string> = { ground: "/calm/ground", breathe: "/calm/breathe", relax: "/calm/relax", "body-scan": "/calm/relax", tipp: "/calm/tipp", sleep: "/calm/wind-down", "wind-down": "/calm/wind-down" };

/** 6.1 · Calm space — Figma node 123:2080 */
function CalmSpace() {
  const router = useRouter();
  const tool = useSearchParams().get("tool");
  useEffect(() => {
    if (tool && ALIAS[tool]) router.replace(ALIAS[tool]);
  }, [tool, router]);

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title="Calm space" sub="Works offline" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">What does your body need?</h1>
      <p className="type-body-m text-t2">Pick by feeling. Everything here takes 1–5 minutes.</p>
      <ul className="flex w-full flex-col gap-3">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
              <span className={`flex size-[38px] shrink-0 items-center justify-center rounded-[13px] ${t.bg}`}>
                <FigmaIcon name={t.icon} size={20} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{t.title}</span>
                <span className="type-caption text-t3">{t.note}</span>
              </span>
              <span className="rounded-full bg-lavender-soft px-2 py-[3px] type-caption text-lavender-text">{t.tag}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Grow />
      <Link href="/crisis" className="flex w-full items-center gap-2.5 rounded-[16px] bg-peach-soft p-3">
        <FigmaIcon name="lifebuoy-peach" size={20} />
        <span className="flex-1 type-label-m text-peach-text">Feeling unsafe? Talk to someone now</span>
        <FigmaIcon name="chevron-right-peach-16" size={16} />
      </Link>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <CalmSpace />
    </Suspense>
  );
}
