"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FlowHeader, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { cn } from "@/lib/cn";

const RATINGS = [
  { id: "hard", label: "Hard", feeling: "Sad", intensity: 70 },
  { id: "meh", label: "Meh", feeling: "Numb", intensity: 50 },
  { id: "mixed", label: "Mixed", feeling: "Okay", intensity: 45 },
  { id: "good", label: "Good", feeling: "Calm", intensity: 30 },
  { id: "great", label: "Great", feeling: "Calm", intensity: 15 },
] as const;
const NEXT = [
  { label: "Park a worry", href: "/tools" },
  { label: "Three good things", href: "/tools" },
  { label: "No, I'm done", href: "/home" },
];

function Moment({ icon, bg, label, value, onChange, placeholder }: { icon: string; bg: string; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex flex-1 flex-col items-start gap-2 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
      <Tile size={30} radius={10} bg={bg}>
        <FigmaIcon name={icon} size={16} />
      </Tile>
      <span className="type-label-s text-t3">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} className="w-full resize-none bg-transparent type-label-m text-t1 outline-none placeholder:text-t-disabled" />
    </label>
  );
}

/** C8 · Evening check-in — Figma node 135:3077 */
export default function EveningCheckIn() {
  const router = useRouter();
  const { items, add } = useCheckIns();
  const [rating, setRating] = useState<string>("");
  const [high, setHigh] = useState("");
  const [low, setLow] = useState("");
  const [next, setNext] = useState(2);
  const [done, setDone] = useState<boolean | null>(null);
  const today = new Date().toDateString();
  const intention = items.find((c) => c.style === "morning" && c.intention && new Date(c.at).toDateString() === today)?.intention;

  function save() {
    const r = RATINGS.find((x) => x.id === rating) ?? RATINGS[2];
    add({ style: "evening", feeling: r.feeling, word: r.label.toLowerCase(), intensity: r.intensity, note: [high && `High: ${high}`, low && `Low: ${low}`].filter(Boolean).join(" · ") || undefined });
    router.push(NEXT[next].href);
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader solid icon="close" label="Close check-in" title="Evening" sub="Close the day · 30 seconds" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">How was today, overall?</h1>
      <div role="radiogroup" aria-label="Today" className="flex w-full gap-1.5">
        {RATINGS.map((r) => {
          const on = rating === r.id;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setRating(r.id)}
              className={cn("flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-[16px] py-2.5", on ? "border-[1.5px] border-lime bg-sun-soft" : "border border-white bg-surface")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma rating dot */}
              <img src={`/figma/evening/${r.id}.svg`} alt="" width={16} height={16} />
              <span className="type-caption text-t1">{r.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex w-full gap-2.5">
        <Moment icon="sun-sun-16" bg="bg-sun-soft" label="HIGH POINT" value={high} onChange={setHigh} placeholder="A small good moment…" />
        <Moment icon="cloud-sky-16" bg="bg-sky-soft" label="LOW POINT" value={low} onChange={setLow} placeholder="What was hard…" />
      </div>
      {intention && (
        <button type="button" onClick={() => setDone(!done)} className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] border border-white bg-surface p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
          <Tile size={34} radius={11} bg={done === false ? "bg-subtle" : "bg-lime-soft"}>
            {done !== false && <FigmaIcon name="check-limedeep-18b" size={18} />}
          </Tile>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="type-caption text-t3">This morning&apos;s intention · tap to change</span>
            <span className="type-label-m text-t1">
              &ldquo;{intention}&rdquo; — {done === false ? "not today, that's okay" : "done"}
            </span>
          </span>
        </button>
      )}
      <p className="type-label-m text-t2">Anything still on your mind?</p>
      <div className="flex w-full flex-wrap gap-2">
        {NEXT.map((n, i) => (
          <SoftChip key={n.label} label={n.label} selected={next === i} onClick={() => setNext(i)} />
        ))}
      </div>
      <Grow />
      <Pill label="Close the day" className="w-full" onClick={save} />
    </FigmaScreen>
  );
}
