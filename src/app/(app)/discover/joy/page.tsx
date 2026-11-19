"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CARD, OHeader } from "@/components/discover/parts";
import { FigmaIcon, ImageSlot, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { cn } from "@/lib/cn";
import { huntFor, joys, uid } from "@/lib/discover";
import { shrinkPhoto } from "@/lib/photo";

const SAVOUR = 20;
const GLASS = "flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/85 backdrop-blur-[12px]";

/** O8 · Joy hunt (savouring) — Figma node 147:3780. One find a day, then 20 seconds of noticing. */
export default function JoyHunt() {
  const router = useRouter();
  const toast = useToast();
  const [skip, setSkip] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [left, setLeft] = useState(SAVOUR);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const prompt = huntFor(new Date(), skip);

  useEffect(() => {
    if (!photo || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [photo, left]);
  useEffect(() => {
    if (photo && left === 0) {
      joys.add({ id: uid(), at: new Date().toISOString(), prompt, photo });
      toast.show("Saved to your joy finds.");
    }
  }, [photo, left, prompt, toast]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(await shrinkPhoto(f));
    setLeft(SAVOUR);
  };

  return (
    <FigmaScreen gap={12}>
      <OHeader icon="close" label="Close" title="Joy hunt" sub="Today's find · 1 photo · 20 s" onClick={() => router.back()} />
      <div className="flex w-full items-center gap-2.5 rounded-[20px] p-3.5" style={{ backgroundImage: "linear-gradient(169.49deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <Tile size={36} radius={12} bg="bg-white/12">
          <FigmaIcon name="leaf-lime-19" size={19} />
        </Tile>
        <div className="flex flex-col gap-0.5">
          <p className="type-label-s text-lime">TODAY&apos;S HUNT</p>
          <p className="type-label-m text-white">{prompt}</p>
        </div>
      </div>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- the person's own photo, stored on device
        <img src={photo} alt={`Your find: ${prompt}`} className="h-[300px] w-full rounded-[28px] object-cover" />
      ) : (
        <ImageSlot height={300} prompt="Your photo goes here — tap the camera when you find it" />
      )}
      <div className={cn("flex w-full items-center gap-3 rounded-[20px] p-3.5", CARD)}>
        <Tile size={36} radius={12} bg="bg-sun-soft">
          <FigmaIcon name="timer-sun-19" size={19} />
        </Tile>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="type-label-m text-t1">{photo && left === 0 ? "Savoured. Nice find." : "Savour it for 20 seconds"}</p>
          <p className="type-caption text-t3">What colour? What texture? Why this one?</p>
          <div className="h-1.5 w-[120px] rounded-[3px]" role="progressbar" aria-valuemin={0} aria-valuemax={SAVOUR} aria-valuenow={SAVOUR - left} aria-label="Savouring">
            <div className="h-1.5 rounded-[3px] bg-sun-text transition-[width] duration-1000 ease-linear" style={{ width: `${photo ? ((SAVOUR - left) / SAVOUR) * 100 : 100}%` }} />
          </div>
        </div>
      </div>
      <Grow />
      <div className="flex w-full items-center justify-center gap-6">
        <button type="button" aria-label="Another hunt" onClick={() => {
            setSkip((s) => s + 1);
            setPhoto(null);
          }} className={GLASS}>
          <FigmaIcon name="refresh-t1-20" size={20} />
        </button>
        <button type="button" aria-label="Take a photo" onClick={() => camera.current?.click()} className="flex size-[72px] cursor-pointer items-center justify-center rounded-[36px] border-4 border-lime-deep bg-surface shadow-[0_10px_24px_rgba(21,26,19,0.15)]">
          <FigmaIcon name="camera-forest-28" size={28} />
        </button>
        <button type="button" aria-label="Choose from photos" onClick={() => gallery.current?.click()} className={GLASS}>
          <FigmaIcon name="image-t1-20" size={20} />
        </button>
        <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
        <input ref={gallery} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} aria-hidden />
      </div>
    </FigmaScreen>
  );
}
