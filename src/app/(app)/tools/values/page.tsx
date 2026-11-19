"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { compass } from "@/lib/tool-store";

const VALUES = ["Family", "Being kind", "Growing", "Friendship", "Health", "Honesty", "Creativity", "Independence", "Faith", "Adventure"];
const STEP_FOR: Record<string, string> = {
  Family: "Send them a photo from today",
  "Being kind": "Do one small kind thing for someone",
  Growing: "Learn one new thing for 10 minutes",
  Friendship: "Message one friend you miss",
  Health: "Take a 10-minute walk",
  Honesty: "Say one true thing you've been holding back",
  Creativity: "Make something small, just for you",
  Independence: "Do one task fully your own way",
  Faith: "Take five quiet minutes",
  Adventure: "Try one thing you've never done",
};

/** 5.6 · What matters to you — Figma node 121:2091 */
export default function Values() {
  const router = useRouter();
  const toast = useToast();
  const { chats, ready } = useChats();
  const [picked, setPicked] = useState<string[] | null>(null);
  const [why, setWhy] = useState("");
  const [step, setStep] = useState("");
  const [voice, setVoice] = useState(false);

  useEffect(() => {
    if (!ready || picked) return;
    const saved = compass.get();
    const who = chats.map((c) => c.topic.match(/fight with (\w+)/)?.[1]).find(Boolean);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from device storage */
    setPicked(saved?.values ?? []);
    setWhy(saved?.why ?? (who ? `"I want ${who[0].toUpperCase() + who.slice(1)} to know I love them, even when we fight."` : ""));
    setStep(saved?.step ?? "");
    setVoice(!!saved?.voice);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [ready, picked, chats]);

  if (!picked) return <FigmaScreen mood="calm">{null}</FigmaScreen>;
  const toggle = (v: string) => setPicked(picked.includes(v) ? picked.filter((x) => x !== v) : picked.length < 3 ? [...picked, v] : picked);
  const suggested = step || (picked[0] ? STEP_FOR[picked[0]] : "");

  function dictate() {
    type SR = { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; lang: string };
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return document.getElementById("why")?.focus();
    const r = new Ctor();
    r.lang = "en-IN";
    r.onresult = (e) => {
      setWhy(`"${Array.from(e.results, (x) => x[0].transcript).join(" ")}"`);
      setVoice(true);
    };
    r.start();
  }

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title="Your values compass" sub="ACT · 4 minutes" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">What do you want to stand for?</h1>
      <p className="type-body-m text-t2">Pick up to three. These become your &quot;why&quot; on hard days.</p>
      <div role="group" aria-label="Values" className="flex flex-wrap gap-2">
        {VALUES.map((v) => (
          <SoftChip key={v} label={v} selected={picked.includes(v)} onClick={() => toggle(v)} />
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[24px] p-4" style={{ backgroundImage: "linear-gradient(158.77deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <p className="type-label-s text-lime">YOUR WHY, IN YOUR WORDS</p>
        <textarea
          id="why"
          value={why}
          onChange={(e) => {
            setWhy(e.target.value);
            setVoice(false);
          }}
          rows={3}
          placeholder="Why do these matter to you?"
          aria-label="Your why"
          className="w-full resize-none bg-transparent type-title-l text-white outline-none placeholder:text-white/50"
        />
        <button type="button" onClick={dictate} className="flex cursor-pointer items-center gap-1.5 self-start">
          <FigmaIcon name="mic-lime-14" size={14} />
          <span className="type-caption text-lime">{voice ? "Said by voice · tap to edit" : "Say it · or type above"}</span>
        </button>
      </div>
      <label className="flex w-full flex-col gap-1.5 rounded-[18px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <span className="type-label-s text-t3">ONE SMALL STEP TOWARD IT</span>
        <input value={suggested} onChange={(e) => setStep(e.target.value)} placeholder="Pick a value to get an idea" className="w-full bg-transparent type-label-m text-t1 outline-none placeholder:text-t3" />
      </label>
      <Grow />
      <Pill
        label="Save my compass"
        className="w-full"
        disabled={!picked.length}
        onClick={() => {
          compass.save({ values: picked, why, step: suggested, voice });
          toast.show("Your compass is saved");
          router.push("/tools");
        }}
      />
    </FigmaScreen>
  );
}
