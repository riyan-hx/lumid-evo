"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { decide } from "@/lib/router";

const W = 345;
const H = 300;
const XS = [57.5, 115, 172.5, 230, 287.5]; // dot centres in the Figma grid
const YS = [50, 100, 150, 200, 250];
const QUAD = {
  tl: { feeling: "Anxious", label: "Anxious · angry · stressed", words: ["tense", "worried", "restless", "irritated", "stressed", "angry"] },
  tr: { feeling: "Okay", label: "Excited · energised · proud", words: ["excited", "energised", "proud", "hopeful"] },
  bl: { feeling: "Sad", label: "Sad · tired · lonely", words: ["sad", "tired", "lonely", "low"] },
  br: { feeling: "Calm", label: "Calm · content · relieved", words: ["calm", "content", "relieved", "settled"] },
} as const;
type Q = keyof typeof QUAD;
const quadOf = (x: number, y: number): Q => (y < H / 2 ? (x < W / 2 ? "tl" : "tr") : x < W / 2 ? "bl" : "br");

/** C3 · Mood meter — Figma node 134:2916. Energy (up) × pleasantness (right). */
export default function MoodMeter() {
  const router = useRouter();
  const { add, items } = useCheckIns();
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  const [word, setWord] = useState("");
  const q = spot ? quadOf(spot.x, spot.y) : null;
  const words = q ? QUAD[q].words.slice(0, 4) : [];
  const energy = spot ? Math.round(((H - spot.y) / H) * 4) : 0;

  function pick(x: number, y: number) {
    setSpot({ x, y });
    setWord(QUAD[quadOf(x, y)].words[0]);
  }
  function next() {
    if (!spot || !q) return;
    // Intensity: distance from the calm centre line, 0–100.
    const intensity = Math.min(100, Math.round((Math.hypot(spot.x - W / 2, spot.y - H / 2) / Math.hypot(W / 2, H / 2)) * 100));
    const item = add({ style: "meter", feeling: QUAD[q].feeling, word, intensity, energy });
    router.push(decide(item, items).safety ? "/check-in/low" : "/check-in?step=reflect");
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader solid icon="close" label="Close check-in" title="Check-in" sub="Mood meter" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">Where are you right now?</h1>
      <p className="type-body-m text-t2">Tap the spot. Up = more energy, right = more pleasant.</p>
      <div
        role="application"
        aria-label="Mood meter. Use arrow keys to move."
        tabIndex={0}
        onKeyDown={(e) => {
          const s = spot ?? { x: W / 2, y: H / 2 };
          const d = 28;
          const m: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
          if (m[e.key]) {
            e.preventDefault();
            pick(Math.max(8, Math.min(W - 8, s.x + m[e.key][0])), Math.max(8, Math.min(H - 8, s.y + m[e.key][1])));
          }
        }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          pick(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
        }}
        className="relative h-[300px] w-full cursor-pointer overflow-hidden rounded-[28px]"
      >
        {(Object.keys(QUAD) as Q[]).map((k) => (
          <div
            key={k}
            className={`absolute h-1/2 w-1/2 p-3 ${k === "tl" ? "top-0 left-0 bg-peach-soft" : k === "tr" ? "top-0 left-1/2 bg-sun-soft" : k === "bl" ? "top-1/2 left-0 bg-sky-soft" : "top-1/2 left-1/2 bg-mint-soft"}`}
          >
            <p className="type-caption text-t2">{QUAD[k].label}</p>
          </div>
        ))}
        {XS.flatMap((x) =>
          YS.map((y) => (
            // eslint-disable-next-line @next/next/no-img-element -- Figma grid dot
            <img key={`${x}-${y}`} src="/figma/meter-dot.svg" alt="" width={6} height={6} className="pointer-events-none absolute" style={{ left: `calc(${(x / W) * 100}% - 3px)`, top: y - 3 }} />
          )),
        )}
        {spot && (
          <>
            <div className="pointer-events-none absolute" style={{ left: `calc(${(spot.x / W) * 100}% - 22px)`, top: spot.y - 22 }}>
              <Orb size={44} />
            </div>
            <span
              role="status"
              className="pointer-events-none absolute rounded-full px-2.5 py-1.5 type-caption whitespace-nowrap text-white"
              style={{
                left: spot.x < W - 150 ? `calc(${(spot.x / W) * 100}% + 26px)` : undefined,
                right: spot.x >= W - 150 ? `calc(${100 - (spot.x / W) * 100}% + 26px)` : undefined,
                top: spot.y - 12,
                backgroundImage: "linear-gradient(166.8deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)",
              }}
            >
              {word ? word[0].toUpperCase() + word.slice(1) : ""} · {energy >= 3 ? "high" : energy >= 2 ? "some" : "low"} energy
            </span>
          </>
        )}
      </div>
      <div className="flex w-full type-caption text-t3">
        <p className="flex-1">← unpleasant</p>
        <p>pleasant →</p>
      </div>
      <p className="type-label-s text-t3">WORDS NEAR YOUR SPOT</p>
      <div className="flex w-full flex-wrap gap-2">
        {spot ? words.map((w) => <SoftChip key={w} label={w} selected={word === w} onClick={() => setWord(w)} />) : <p className="type-body-s text-t3">Tap the grid first.</p>}
      </div>
      <Grow />
      <Pill label="Next" className="w-full" onClick={next} />
    </FigmaScreen>
  );
}
