"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { activities, type GoodThing, goodThings } from "@/lib/tool-store";

const PEOPLE = /\b(friend|amma|mum|mom|dad|sister|brother|sent|called|texted|hug|with)\b/i;
const ORDINAL = ["Add one — even tiny", "Add a second", "Add a third — even tiny"];
const sameDay = (iso: string, d = new Date()) => new Date(iso).toDateString() === d.toDateString();

/** Shrinks a photo to a 160 px thumbnail so it fits in device storage. */
async function thumb(file: File) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const s = 160 / Math.max(img.width, img.height);
  const c = document.createElement("canvas");
  c.width = img.width * s;
  c.height = img.height * s;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.7);
}

/** 5.7 · Three good things — Figma node 121:2161 */
export default function GoodThings() {
  const router = useRouter();
  const toast = useToast();
  const { chats } = useChats();
  const [all, setAll] = useState<GoodThing[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [why, setWhy] = useState("");
  const [photo, setPhoto] = useState<string>();
  const [mode, setMode] = useState<"Say it" | "Photo" | "Pick from today">("Pick from today");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setAll(goodThings.all()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration from device storage

  if (!all) return <FigmaScreen>{null}</FigmaScreen>;
  const today = all.filter((g) => sameDay(g.at));
  const month = all.filter((g) => new Date(g.at).getMonth() === new Date().getMonth()).length;
  const ideas = [
    ...activities.all().filter((a) => a.reviewedAt && sameDay(a.reviewedAt)).map((a) => a.text),
    ...chats.filter((c) => c.fairer && sameDay(c.updatedAt)).map(() => "I looked at a hard thought and made it fairer"),
    ...chats.filter((c) => c.step?.done && c.step.doneAt && sameDay(c.step.doneAt)).map((c) => c.step!.text),
  ].filter((t) => !today.some((g) => g.text === t));

  const add = (t = text, w = why) => {
    if (!t.trim()) return;
    const g = goodThings.make({ text: t.trim(), why: w.trim(), kind: PEOPLE.test(t) ? "people" : "leaf", photo });
    const next = [g, ...all];
    setAll(next);
    goodThings.save(next);
    setText("");
    setWhy("");
    setPhoto(undefined);
    setAdding(false);
  };

  function dictate() {
    type SR = { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; lang: string };
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    setAdding(true);
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-IN";
    r.onresult = (e) => setText(Array.from(e.results, (x) => x[0].transcript).join(" "));
    r.start();
  }

  return (
    <FigmaScreen gap={12}>
      <FlowHeader icon="close" label="Close" title="Before bed" sub="Positive psychology · 2 min" onClick={() => router.push("/tools")} />
      <h1 className="type-flow-title text-forest">Three good things today</h1>
      <p className="type-body-m text-t2">Small counts. Tap, say, or snap a photo.</p>
      {[...today].reverse().map((g) => (
        <div key={g.id} className="flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          {g.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- user's own thumbnail (data URL)
            <img src={g.photo} alt="" className="size-9 shrink-0 rounded-[12px] object-cover" />
          ) : (
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-[12px] ${g.kind === "people" ? "bg-peach-soft" : "bg-lime-soft"}`}>
              <FigmaIcon name={g.kind === "people" ? "users-peach-19" : "leaf-limedeep-19"} size={19} />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="type-label-m text-t1">{g.text}</span>
            {g.why && <span className="type-caption text-t3">Because {g.why.replace(/^because\s+/i, "")}</span>}
          </span>
        </div>
      ))}
      {today.length < 3 &&
        (adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
            className="flex w-full flex-col gap-2 rounded-[18px] border border-dashed border-lime bg-white/78 p-3"
          >
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Something good, even tiny" aria-label="A good thing" className="w-full bg-transparent type-label-m text-t1 outline-none placeholder:text-t3" />
            <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Because…" aria-label="Why it was good" className="w-full bg-transparent type-caption text-t2 outline-none placeholder:text-t3" />
            <button type="submit" className="self-end type-label-m text-lime-deep">
              Add
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] border border-dashed border-lime bg-white/78 p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
            <span className="flex size-9 items-center justify-center rounded-[12px] bg-subtle">
              <FigmaIcon name="plus-t3-19" size={19} />
            </span>
            <span className="flex-1 type-label-m text-lime-deep">{ORDINAL[today.length]}</span>
          </button>
        ))}
      <div className="flex flex-wrap gap-2">
        <SoftChip
          label="Say it"
          selected={mode === "Say it"}
          onClick={() => {
            setMode("Say it");
            dictate();
          }}
        />
        <SoftChip
          label="Photo"
          selected={mode === "Photo"}
          onClick={() => {
            setMode("Photo");
            fileRef.current?.click();
          }}
        />
        <SoftChip label="Pick from today" selected={mode === "Pick from today"} onClick={() => setMode("Pick from today")} />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPhoto(await thumb(f));
          setAdding(true);
        }}
      />
      {mode === "Pick from today" && ideas.length > 0 && today.length < 3 && (
        <div className="flex flex-wrap gap-2">
          {ideas.slice(0, 3).map((t) => (
            <SoftChip key={t} label={t} height={36} onClick={() => add(t, "")} />
          ))}
        </div>
      )}
      <Grow />
      <div className="flex w-full items-center gap-2.5 rounded-[18px] bg-sun-soft p-3">
        <FigmaIcon name="star-sun-18" size={18} />
        <p className="flex-1 type-body-s text-sun-text">{month ? `You've noticed ${month} good ${month === 1 ? "thing" : "things"} this month.` : "Your first good thing this month is waiting."}</p>
      </div>
      <Pill
        label="Save and wind down"
        className="w-full"
        onClick={() => {
          toast.show("Saved · sleep well");
          router.push("/calm/wind-down");
        }}
      />
    </FigmaScreen>
  );
}
