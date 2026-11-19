"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { useCheckIns } from "@/lib/checkins";

type Need = "Thoughts spiralling" | "Feeling too much" | "Can't get going" | "Hard on myself" | "Can't sleep";
type ToolId = "thought" | "worry" | "problem" | "compassion" | "values" | "activity" | "good";

const NEEDS: Need[] = ["Thoughts spiralling", "Feeling too much", "Can't get going", "Hard on myself", "Can't sleep"];
const TOOLS: Record<ToolId, { title: string; note: string; icon: string; bg: string; tag: string; href: string }> = {
  thought: { title: "Thought record", note: "Untangle one sticky thought · 5 min", icon: "brain-lav-20", bg: "bg-lavender-soft", tag: "CBT", href: "/tools/thought-record" },
  worry: { title: "Worry time", note: "Park worries for later · 2 min", icon: "parking-sun-20", bg: "bg-sun-soft", tag: "CBT", href: "/tools/worry" },
  problem: { title: "Solve one problem", note: "Five small steps · 6 min", icon: "idea-sky-20", bg: "bg-sky-soft", tag: "CBT", href: "/tools/problem" },
  compassion: { title: "Self-compassion break", note: "Three kind sentences · 2 min", icon: "heart-peach-20", bg: "bg-peach-soft", tag: "CFT", href: "/tools/compassion" },
  activity: { title: "Lift your mood", note: "Plan one good thing · 3 min", icon: "leaf-limedeep-19", bg: "bg-lime-soft", tag: "BA", href: "/tools/activity" },
  good: { title: "Three good things", note: "Before bed · 2 min", icon: "star-sun-18", bg: "bg-sun-soft", tag: "PP", href: "/tools/good-things" },
  values: { title: "What matters to you", note: "Your values compass · 4 min", icon: "compass-mint-20", bg: "bg-mint-soft", tag: "ACT", href: "/tools/values" },
};
/** Evidence-based order per need: the first tool is the one most likely to help. */
const ORDER: Record<Need, ToolId[]> = {
  "Thoughts spiralling": ["thought", "worry", "problem", "compassion", "values"],
  "Feeling too much": ["compassion", "worry", "thought", "values", "problem"],
  "Can't get going": ["activity", "problem", "values", "compassion", "thought"],
  "Hard on myself": ["compassion", "thought", "values", "worry", "problem"],
  "Can't sleep": ["worry", "good", "compassion", "thought", "problem"],
};

function needFor(feeling?: string): Need {
  const f = (feeling ?? "").toLowerCase();
  if (/(overwhelm|angry|mad|panic)/.test(f)) return "Feeling too much";
  if (/(tired|flat|numb|low|sad)/.test(f)) return "Can't get going";
  if (/(guilt|ashamed|lonely|not enough)/.test(f)) return "Hard on myself";
  return "Thoughts spiralling";
}

/** 4.1 · Toolkit — Figma node 118:1836 */
export default function Toolkit() {
  const router = useRouter();
  const { items } = useCheckIns();
  const [now] = useState(() => Date.now());
  const latest = items[0];
  const recent = latest && now - new Date(latest.at).getTime() < 12 * 36e5 ? latest : null;
  const [need, setNeed] = useState<Need | null>(null);
  const active = need ?? needFor(recent?.word || recent?.feeling);

  return (
    <FigmaScreen gap={12}>
      <FlowHeader icon="chevron-left" label="Back" title="Your toolkit" sub="Proven tools, picked for how you feel" onClick={() => router.back()} />
      <div className="flex w-full items-center gap-2.5 rounded-[18px] bg-sky-soft p-3">
        <FigmaIcon name="cloud-sky-18" size={18} />
        <p className="flex-1 type-body-s text-sky-text">{recent ? `Right now: ${(recent.word || recent.feeling).toLowerCase()}, ${recent.intensity}. Tools that help with that are first.` : "Pick what's going on — the tools that help most come first."}</p>
      </div>
      <div role="group" aria-label="What's going on" className="flex flex-wrap gap-2">
        {NEEDS.map((n) => (
          <SoftChip key={n} label={n} selected={active === n} onClick={() => setNeed(n)} />
        ))}
      </div>
      <ul className="flex w-full flex-col gap-3">
        {ORDER[active].map((id) => {
          const t = TOOLS[id];
          return (
            <li key={id}>
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
          );
        })}
      </ul>
    </FigmaScreen>
  );
}
