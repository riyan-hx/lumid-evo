"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { useProfile } from "@/lib/profile";

type SR = { start: () => void; stop: () => void; abort: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; lang: string; interimResults: boolean; continuous: boolean };
type Lang = "English" | "Malayalam";

const BARS = [10, 18, 30, 42, 26, 36, 20, 40, 24, 14, 32, 18, 10];

/** 3.3 · Voice — Figma node 117:1869. Speech becomes text on the device; only the text is sent. */
export default function Voice() {
  const router = useRouter();
  const { profile } = useProfile();
  const [lang, setLang] = useState<Lang | null>(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const rec = useRef<SR | null>(null);
  const language: Lang = lang ?? (profile.chatLanguage === "Malayalam" || profile.locales.includes("Malayalam") ? "Malayalam" : "English");

  function listen(l: Lang = language) {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return setSupported(false);
    rec.current?.abort();
    const r = new Ctor();
    r.lang = l === "Malayalam" ? "ml-IN" : "en-IN";
    r.interimResults = true;
    r.continuous = true;
    r.onresult = (e) => setText(Array.from(e.results, (x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  }

  useEffect(() => () => rec.current?.abort(), []);

  function send() {
    const t = text.trim();
    if (!t) return;
    rec.current?.stop();
    router.push(`/chat/live?voice=1&lang=${language}&q=${encodeURIComponent(t)}`);
  }

  return (
    <FigmaScreen gap={14} mood="night">
      <div className="flex w-full items-center gap-2.5">
        <button type="button" aria-label="Close" onClick={() => router.back()} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/12 backdrop-blur-[12px]">
          <FigmaIcon name="close-white" size={20} />
        </button>
        <div className="flex flex-1 flex-col gap-px">
          <h1 className="type-label-m text-white">Talk to Evo</h1>
          <p className="type-caption text-lime">Only the text leaves this screen</p>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div role="radiogroup" aria-label="Language" className="flex gap-1 rounded-full bg-white/12 p-1">
          {(["English", "Malayalam"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={language === l}
              onClick={() => {
                setLang(l);
                if (listening) listen(l);
              }}
              className={cn("cursor-pointer rounded-full px-[18px] py-[9px] type-label-m", language === l ? "bg-surface text-forest" : "text-lime-soft")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <Grow />
      <button type="button" aria-label={listening ? "Stop listening" : "Start listening"} aria-pressed={listening} onClick={() => (listening ? rec.current?.stop() : listen())} className="flex w-full cursor-pointer justify-center">
        <Orb size={150} state={listening ? "breathing" : "idle"} />
      </button>
      <div aria-hidden className={cn("flex h-11 w-full items-center justify-center gap-1", !listening && "opacity-40")}>
        {BARS.map((h, i) => (
          <span key={i} className={cn("w-[5px] rounded-[3px]", listening && "evo-typing-dot")} style={{ height: h, backgroundImage: "var(--gradient-lime)", animationDelay: `${i * 70}ms` }} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[24px] border border-white bg-white/12 p-4">
        <p className="type-label-s text-lime">{supported ? "WHAT I HEARD — TAP A WORD TO FIX IT" : "TYPE IT — VOICE ISN'T AVAILABLE HERE"}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          lang={language === "Malayalam" ? "ml" : "en"}
          placeholder={listening ? "Listening…" : supported ? "Tap the orb and speak" : "Say it in your words…"}
          aria-label="What Evo heard"
          className="w-full resize-none bg-transparent text-[18px] leading-[1.5] font-medium text-white outline-none placeholder:text-white/50"
        />
        {language === "Malayalam" && text && <p className="type-body-s text-lime-soft">Evo will reply in Malayalam and English.</p>}
      </div>
      <Grow />
      <div className="flex w-full gap-2.5">
        <Pill label="Send" variant="lime" className="flex-1" disabled={!text.trim()} onClick={send} />
        <Pill
          label="Again"
          variant="glass"
          icon={null}
          onClick={() => {
            setText("");
            listen();
          }}
        />
      </div>
    </FigmaScreen>
  );
}
