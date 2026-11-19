"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CARD, OHeader, ORow, Waveform } from "@/components/discover/parts";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SectionLabel } from "@/components/figma/parts";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { type FutureNote, notes, uid } from "@/lib/discover";
import { mmss, useRecorder } from "@/lib/use-recorder";

const PROMPTS = ["What got you through before", "Who loves you", "What you're proud of"];
const WHEN: Record<FutureNote["when"], string> = { low3: "After 3 low check-ins · or when you ask", ask: "Only when you ask" };
const GLASS = "flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/85 backdrop-blur-[12px] disabled:opacity-40";

/** O2 · Letter to a future hard day — Figma node 146:4466. Kept on this phone. */
export default function FutureNotePage() {
  const router = useRouter();
  const toast = useToast();
  const r = useRecorder();
  const audio = useRef<HTMLAudioElement>(null);
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [when, setWhen] = useState<FutureNote["when"]>("low3");
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<FutureNote | null>(null);
  useEffect(() => setSaved(notes.all()[0] ?? null), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage

  const recording = r.state === "recording";
  const main = () => (recording ? r.stop() : r.start());
  const play = () => audio.current?.play();

  return (
    <FigmaScreen gap={14} mood="calm">
      <OHeader icon="close" label="Close" title="Future-self note" sub="Plays only when you need it" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">What would you want to hear on a hard day?</h1>
      <p className="type-body-m text-t2">Speak to the you who&apos;s struggling. Evo keeps it safe until then.</p>
      <div className={`flex w-full flex-col items-center gap-3.5 rounded-[28px] p-[18px] ${CARD}`}>
        <Waveform live={recording} />
        <p className="type-title-m text-t1" aria-live="polite">
          {r.state === "denied" ? "Mic is off — write it instead" : mmss(r.seconds || saved?.seconds || 0)}
        </p>
        {r.state === "denied" ? (
          <textarea aria-label="Your note" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Dear me, on a hard day…" className="w-full resize-none rounded-[14px] border border-line bg-white px-3 py-2 type-body-m outline-none focus:border-lime-deep" />
        ) : (
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Record again" onClick={r.reset} disabled={!r.url} className={GLASS}>
              <FigmaIcon name="refresh-t1-20" size={20} />
            </button>
            <button
              type="button"
              aria-label={recording ? "Stop recording" : "Record"}
              onClick={main}
              className="flex size-[72px] cursor-pointer items-center justify-center rounded-[36px] shadow-[0_12px_24px_rgba(21,26,19,0.2)]"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}
            >
              {recording ? <FigmaIcon name="pause-forest-28" size={28} /> : <span className="size-6 rounded-full bg-forest" />}
            </button>
            <button type="button" aria-label="Play it back" onClick={play} disabled={!r.url && !saved?.audio} className={GLASS}>
              <FigmaIcon name="play-t1-20" size={20} />
            </button>
          </div>
        )}
        <audio ref={audio} src={r.url ?? saved?.audio} hidden />
      </div>
      <SectionLabel>PROMPTS IF YOU&apos;RE STUCK</SectionLabel>
      <div className="flex w-full flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <SoftChip key={p} label={p} selected={prompt === p} onClick={() => setPrompt(p)} />
        ))}
      </div>
      <button type="button" onClick={() => setWhen((w) => (w === "low3" ? "ask" : "low3"))} className="w-full cursor-pointer">
        <ORow icon="bell-limedeep-19" tileBg="bg-lime-soft" title="When should Evo play it?" note={WHEN[when]}>
          <FigmaIcon name="chevron-right" size={18} />
        </ORow>
      </button>
      <Grow />
      <Pill
        label="Save my note"
        className="w-full"
        disabled={!r.url && !text.trim()}
        onClick={() => {
          notes.add({ id: uid(), at: new Date().toISOString(), audio: r.url ?? undefined, seconds: r.seconds, text: text.trim() || undefined, when });
          toast.show("Saved. It'll be here on a harder day.");
          router.push("/discover");
        }}
      />
    </FigmaScreen>
  );
}
