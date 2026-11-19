"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { decide } from "@/lib/router";
import { cn } from "@/lib/cn";
import { parseSpeech, type Heard } from "@/lib/parse-speech";
import { useProfile } from "@/lib/profile";

const WAVE = [8, 16, 26, 38, 22, 32, 18, 36, 20, 12, 28, 16, 8];
const FEELING_OPTIONS = ["Anxious", "Sad", "Angry", "Lonely", "Numb", "Overwhelmed", "Calm", "Okay"];
const ENERGY_OPTIONS: Heard["energy"][] = ["Low", "Medium", "High"];

type Recognition = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };

/** C5 · Say it — Figma node 135:2816. Speech → editable "Evo heard" fields → saved check-in. */
export default function SayIt() {
  const router = useRouter();
  const { add, items } = useCheckIns();
  const { profile } = useProfile();
  const [text, setText] = useState("");
  const [heard, setHeard] = useState<Heard | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [edit, setEdit] = useState<"feeling" | "intensity" | "energy" | null>(null);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false); // eslint-disable-line react-hooks/set-state-in-effect -- capability check on mount
      return;
    }
    const r = new Ctor();
    r.lang = profile.locales[0] === "Malayalam" ? "ml-IN" : "en-IN";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => {
      const t = Array.from(e.results).map((x) => x[0].transcript).join(" ");
      setText(t);
      setHeard(parseSpeech(t));
    };
    r.onend = () => setListening(false);
    rec.current = r;
  }, [profile.locales]);

  function toggle() {
    if (!rec.current) return document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
    if (listening) rec.current.stop();
    else {
      rec.current.start();
      setListening(true);
    }
  }
  function save() {
    if (!heard) return;
    const item = add({ style: "voice", feeling: heard.feelings[0], word: heard.feelings[1]?.toLowerCase(), intensity: heard.intensity, energy: ENERGY_OPTIONS.indexOf(heard.energy) * 2, causes: heard.about, note: text });
    router.push(decide(item, items).safety ? "/check-in/low" : "/check-in?step=reflect");
  }

  const rows: { key: "feeling" | "intensity" | "energy" | null; label: string; value: string; bg: string }[] = heard
    ? [
        { key: "feeling", label: "Feeling", value: heard.feelings.join(" · "), bg: "bg-sky-soft" },
        { key: "intensity", label: "Intensity", value: `About ${heard.intensity}`, bg: "bg-sun-soft" },
        { key: "energy", label: "Energy", value: heard.energy, bg: "bg-lavender-soft" },
        { key: null, label: "About", value: heard.about.join(" · ") || "—", bg: "bg-peach-soft" },
      ]
    : [];

  return (
    <FigmaScreen gap={14} mood="night">
      <div className="flex w-full items-center gap-2.5">
        <button type="button" aria-label="Close check-in" onClick={() => router.push("/home")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white/20 bg-white/14 backdrop-blur-[12px]">
          <FigmaIcon name="close-white" size={20} />
        </button>
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-white">Check-in</p>
          <p className="type-caption text-lime">Say it · English or Malayalam</p>
        </div>
      </div>
      {supported ? (
        <p className="min-h-[56px] text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-white">{text ? `"${text}"` : listening ? "Listening…" : "Tap the mic and say how you are, in your words."}</p>
      ) : (
        <label className="w-full">
          <span className="sr-only">How are you?</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setHeard(e.target.value.trim() ? parseSpeech(e.target.value) : null);
            }}
            rows={3}
            placeholder="Type how you are, in your words…"
            className="w-full resize-none bg-transparent text-[22px] tracking-[-0.088px] leading-[28px] font-medium text-white outline-none placeholder:text-white/50"
          />
        </label>
      )}
      <div aria-hidden className={cn("flex h-10 w-full items-center justify-center gap-1", !listening && !text && "opacity-40")}>
        {WAVE.map((h, i) => (
          <span key={i} className={cn("w-[5px] rounded-[3px]", listening && "animate-pulse")} style={{ height: h, backgroundImage: "var(--gradient-lime)", animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      {heard && (
        <div className="flex w-full flex-col gap-1 rounded-[24px] border border-white/18 bg-white/10 p-4">
          <p className="type-label-s text-lime">EVO HEARD — TAP TO FIX</p>
          {rows.map((r) => (
            <div key={r.label} className="flex flex-col">
              <button type="button" disabled={!r.key} onClick={() => setEdit(edit === r.key ? null : r.key)} className="flex w-full cursor-pointer items-center gap-2.5 py-2.5 text-left disabled:cursor-default">
                <span className="w-20 type-caption text-white">{r.label}</span>
                <span className={cn("rounded-full px-3 py-[7px] type-label-s text-forest", r.bg)}>{r.value}</span>
                <span className="flex-1" />
                {r.key && <FigmaIcon name="pencil-white" size={14} />}
              </button>
              {edit === r.key && r.key === "feeling" && (
                <div className="flex flex-wrap gap-1.5 pb-2 pl-[90px]">
                  {FEELING_OPTIONS.map((f) => (
                    <button key={f} type="button" onClick={() => { setHeard({ ...heard, feelings: [f] }); setEdit(null); }} className="cursor-pointer rounded-full bg-white/14 px-2.5 py-1 type-caption text-white">
                      {f}
                    </button>
                  ))}
                </div>
              )}
              {edit === r.key && r.key === "intensity" && (
                <input aria-label="Intensity" type="range" min={0} max={100} step={5} value={heard.intensity} onChange={(e) => setHeard({ ...heard, intensity: Number(e.target.value) })} className="mb-2 ml-[90px] accent-lime" />
              )}
              {edit === r.key && r.key === "energy" && (
                <div className="flex gap-1.5 pb-2 pl-[90px]">
                  {ENERGY_OPTIONS.map((x) => (
                    <button key={x} type="button" onClick={() => { setHeard({ ...heard, energy: x }); setEdit(null); }} className="cursor-pointer rounded-full bg-white/14 px-2.5 py-1 type-caption text-white">
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Grow />
      {(
        <div className="flex w-full justify-center">
          <button
            type="button"
            aria-label={listening ? "Stop listening" : "Start speaking"}
            aria-pressed={listening}
            onClick={toggle}
            className="flex size-[72px] cursor-pointer items-center justify-center rounded-[36px] shadow-[0_12px_24px_rgba(21,26,19,0.3)]"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}
          >
            <FigmaIcon name="mic-forest-30" size={30} />
          </button>
        </div>
      )}
      <Pill label="Save check-in" variant="lime" className="w-full" onClick={save} />
    </FigmaScreen>
  );
}
