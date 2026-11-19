"use client";

import Link from "next/link";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { TabHeader } from "@/components/you/parts";
import { useCheckIns } from "@/lib/checkins";

const TILES = [
  { href: "/discover/friends-chair", icon: "users-lav-17", bg: "bg-lavender-soft", title: "Friend's chair", note: "Talk to yourself kindly" },
  { href: "/discover/letter", icon: "edit-peach-17", bg: "bg-peach-soft", title: "Unsent letter", note: "Say it, then choose" },
  { href: "/discover/fear", icon: "idea-sun-17", bg: "bg-sun-soft", title: "Test a fear", note: "Prediction vs reality" },
  { href: "/discover/soothe", icon: "gift-mint-17", bg: "bg-mint-soft", title: "Soothe kit", note: "Your 5 senses, ready" },
  { href: "/discover/eyes-closed", icon: "wave-sky-17", bg: "bg-sky-soft", title: "Eyes-closed calm", note: "Breathe by vibration" },
  { href: "/discover/compass", icon: "compass-limedeep-17", bg: "bg-lime-soft", title: "Values compass", note: "Which way, tonight?" },
  { href: "/discover/joy", icon: "leaf-lime-19", bg: "bg-forest", title: "Joy hunt", note: "One small find a day" },
  { href: "/discover/storm-signs", icon: "moon2-lav-19", bg: "bg-lavender-soft", title: "Storm signs", note: "Spot a dip early" },
];

const PLEASANT = /calm|okay|good|happy|content|peaceful|hopeful|grateful|relaxed/i;
const ACTIVATED = /anxious|panic|stressed|angry|overwhelmed|restless/i;

/** Picked from the latest check-in: lighter → leave a note; activated → eyes-closed calm; low → soothe kit. */
function pick(feeling?: string) {
  if (feeling && PLEASANT.test(feeling)) return { href: "/discover/future-note", meta: "2 min · voice", title: "Record a note for a future hard day", why: "You're feeling lighter now — the best time to leave yourself some words." };
  if (feeling && ACTIVATED.test(feeling)) return { href: "/discover/eyes-closed", meta: "2 min · eyes closed", title: "Breathe by vibration, eyes closed", why: "Your body sounded wound up. Let the buzz set the pace." };
  if (feeling) return { href: "/discover/soothe", meta: "1 min · your senses", title: "Open your soothe kit", why: "Heavy days need small, kind things. Yours are ready." };
  return { href: "/discover/future-note", meta: "2 min · voice", title: "Record a note for a future hard day", why: "On a steady day, leave yourself some words for a harder one." };
}

/** O1 · Discover — Figma node 146:4333. */
export default function Discover() {
  const { items } = useCheckIns();
  const p = pick(items[0]?.feeling);
  return (
    <FigmaScreen gap={12} className="pb-[124px]">
      <TabHeader title="Discover" sub="New ways to feel better · all private" />
      <Link href={p.href} className="flex w-full flex-col gap-2.5 rounded-[28px] p-[18px] shadow-[0_18px_36px_-10px_rgba(21,26,19,0.18)]" style={{ backgroundImage: "linear-gradient(151.93deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <span className="flex items-center gap-2.5">
          <Tile size={36} radius={12} bg="bg-white/12">
            <FigmaIcon name="hourglass-lime-19" size={19} />
          </Tile>
          <span className="flex flex-col gap-px">
            <span className="type-label-s text-lime">PICKED FOR TONIGHT</span>
            <span className="type-caption text-white/70">{p.meta}</span>
          </span>
        </span>
        <span className="type-title-l text-white">{p.title}</span>
        <span className="type-body-s text-white/75">{p.why}</span>
      </Link>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="flex flex-col items-start gap-2 rounded-[18px] border border-white bg-white/85 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <Tile size={32} radius={11} bg={t.bg}>
              <FigmaIcon name={t.icon} size={17} />
            </Tile>
            <span className="type-label-m text-t1">{t.title}</span>
            <span className="type-caption text-t3">{t.note}</span>
          </Link>
        ))}
      </div>
      <Link href="/companion" className="flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/85 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <Tile size={32} radius={11} bg="bg-forest">
          <FigmaIcon name="wave-sky-17" size={17} />
        </Tile>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="type-label-m text-t1">Panic companion</span>
          <span className="type-caption text-t3">Four calm steps, full screen</span>
        </span>
        <FigmaIcon name="chevron-right" size={18} />
      </Link>
    </FigmaScreen>
  );
}
