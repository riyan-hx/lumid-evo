"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CARD, OHeader } from "@/components/discover/parts";
import { FigmaIcon, ImageSlot, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { kit, type SootheKit } from "@/lib/discover";
import { shrinkPhoto } from "@/lib/photo";

type Sense = "hear" | "taste" | "touch" | "smell";
const SENSES: { key: Sense; label: string; icon: string; bg: string; text: string; hint: string }[] = [
  { key: "hear", label: "HEAR", icon: "headphones-sky-16", bg: "bg-sky-soft", text: "text-sky-text", hint: "A sound that settles you" },
  { key: "taste", label: "TASTE", icon: "coffee-sun-16", bg: "bg-sun-soft", text: "text-sun-text", hint: "Something to sip or taste" },
  { key: "touch", label: "TOUCH", icon: "hand-peach-16", bg: "bg-peach-soft", text: "text-peach-text", hint: "Something to feel" },
  { key: "smell", label: "SMELL", icon: "flower-mint-16", bg: "bg-mint-soft", text: "text-mint-text", hint: "A scent that calms you" },
];

/** O6 · My soothe kit (5 senses) — Figma node 147:3620. Built on a calm day; "open" walks through it one sense at a time. */
export default function Soothe() {
  const router = useRouter();
  const [k, setK] = useState<SootheKit>(kit.get());
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => setK(kit.get()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  const set = (patch: Partial<SootheKit>) =>
    setK((x) => {
      const next = { ...x, ...patch };
      kit.save(next);
      return next;
    });
  const filled = SENSES.filter((s) => k[s.key].trim());

  if (step !== null) {
    const s = filled[step];
    return (
      <FigmaScreen gap={16} mood="warm">
        <OHeader icon="close" label="Close" title="My soothe kit" sub={s ? `${step + 1} of ${filled.length} · take your time` : "Last one"} onClick={() => setStep(null)} />
        <Grow />
        {s ? (
          <>
            <div className="flex justify-center">
              <Tile size={72} radius={24} bg={s.bg}>
                <FigmaIcon name={s.icon} size={16} />
              </Tile>
            </div>
            <p className={cn("text-center type-label-s", s.text)}>{s.label}</p>
            <h1 className="text-center type-flow-title text-forest">{k[s.key]}</h1>
          </>
        ) : (
          <h1 className="text-center type-flow-title text-forest">{k.quote ? `"${k.quote}"` : "You looked after yourself. That counts."}</h1>
        )}
        <Grow />
        <Pill label={s ? "Next" : "Done"} className="w-full" onClick={() => (s ? setStep(step + 1) : setStep(null))} />
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen gap={12} mood="warm">
      <OHeader icon="close" label="Close" title="My soothe kit" sub="Built on a calm day · opens in one tap" onClick={() => router.back()} />
      <label className="relative block w-full cursor-pointer">
        <span className="sr-only">Add a calming photo</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) set({ photo: await shrinkPhoto(f) });
          }}
        />
        {k.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- the person's own photo, stored on device
          <img src={k.photo} alt="Your calming photo" className="h-[150px] w-full rounded-[24px] object-cover" />
        ) : (
          <ImageSlot height={150} prompt="Add a photo of a place that calms you — tap to choose" />
        )}
      </label>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {SENSES.map((s) => (
          <label key={s.key} className={cn("flex flex-col gap-2 p-3", CARD)}>
            <span className="flex items-center gap-2">
              <Tile size={30} radius={10} bg={s.bg}>
                <FigmaIcon name={s.icon} size={16} />
              </Tile>
              <span className={cn("type-label-s", s.text)}>{s.label}</span>
            </span>
            <textarea aria-label={s.label.toLowerCase()} rows={2} value={k[s.key]} onChange={(e) => set({ [s.key]: e.target.value })} placeholder={s.hint} className="w-full resize-none bg-transparent [field-sizing:content] type-body-s text-t1 outline-none placeholder:text-t3" />
          </label>
        ))}
      </div>
      <label className="flex w-full items-center gap-2.5 rounded-[20px] bg-lavender-soft p-3.5">
        <FigmaIcon name="quote-lav-20" size={20} />
        <span className="sr-only">Words for yourself</span>
        <textarea rows={2} value={k.quote} onChange={(e) => set({ quote: e.target.value })} placeholder="Words that help you ride it out" className="flex-1 resize-none bg-transparent [field-sizing:content] type-body-m text-t1 outline-none placeholder:text-t3" />
      </label>
      <Grow />
      <Pill label="Open my kit now" className="w-full" disabled={!filled.length} onClick={() => setStep(0)} />
    </FigmaScreen>
  );
}
