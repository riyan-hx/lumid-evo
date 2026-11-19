"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FigmaIcon, FigmaSlider, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { type Activity, type ActivityKind, activities } from "@/lib/tool-store";

const OPTIONS: { kind: ActivityKind; text: string; tag: string; icon: string; bg: string; done: string }[] = [
  { kind: "walk", text: "10-minute walk outside", tag: "Moves the body", icon: "leaf-limedeep-19", bg: "bg-lime-soft", done: "You went for the walk." },
  { kind: "call", text: "Call someone you like", tag: "Connection", icon: "phone-peach-19", bg: "bg-peach-soft", done: "You made the call." },
  { kind: "chai", text: "Make chai and sit by the window", tag: "Comfort", icon: "coffee-sun-19", bg: "bg-sun-soft", done: "You took a chai break." },
  { kind: "song", text: "Play one song you love", tag: "Pleasure", icon: "music-lav-19", bg: "bg-lavender-soft", done: "You played the song." },
];
const WHEN = ["After work", "Now", "Tomorrow"];

/** "lifted you 3 of 4 times" from the user's own reviewed activities. */
function track(list: Activity[], kind: ActivityKind) {
  const done = list.filter((a) => a.kind === kind && a.actual !== undefined);
  if (!done.length) return "";
  return ` · lifted you ${done.filter((a) => (a.actual ?? 0) > a.guess || a.mood === "A bit lighter").length} of ${done.length} times`;
}

/** 5.1 · Plan something good — Figma node 120:1963 */
function Plan({ list, onPlanned }: { list: Activity[]; onPlanned: (a: Activity) => void }) {
  const router = useRouter();
  const [kind, setKind] = useState<ActivityKind>("walk");
  const [guess, setGuess] = useState(3);
  const [when, setWhen] = useState(WHEN[0]);
  const pending = list.find((a) => a.actual === undefined);

  return (
    <FigmaScreen gap={12}>
      <FlowHeader icon="chevron-left" label="Back" title="Lift your mood" sub="Behavioural activation" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">Low days shrink our world. Let&apos;s add one good thing.</h1>
      <p className="type-body-m text-t2">Pick something small that you enjoy or that matters.</p>
      {pending && (
        <button type="button" onClick={() => router.push(`/tools/activity?step=review&id=${pending.id}`)} className="flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] border border-dashed border-lime bg-surface p-3 text-left">
          <span className="flex-1 type-label-m text-lime-deep">How was “{pending.text.toLowerCase()}”?</span>
          <FigmaIcon name="chevron-right-16" size={16} />
        </button>
      )}
      <div role="radiogroup" aria-label="One good thing" className="flex w-full flex-col gap-3">
        {OPTIONS.map((o) => {
          const on = kind === o.kind;
          return (
            <button
              key={o.kind}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setKind(o.kind)}
              className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[18px] p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78")}
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[12px]", o.bg)}>
                <FigmaIcon name={o.icon} size={19} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{o.text}</span>
                <span className="type-caption text-t3">
                  {o.tag}
                  {track(list, o.kind)}
                </span>
              </span>
              {on && <FigmaIcon name="check-limedeep-20" size={20} />}
            </button>
          );
        })}
      </div>
      <FigmaSlider label="How much will it help? (guess)" valueText={`${guess} / 10`} fraction={guess / 10} min={0} max={10} step={1} value={guess} onChange={setGuess} />
      <div className="flex flex-wrap gap-2">
        {WHEN.map((w) => (
          <SoftChip key={w} label={w} selected={when === w} onClick={() => setWhen(w)} />
        ))}
      </div>
      <Grow />
      <Pill label="Plan it" className="w-full" onClick={() => onPlanned(activities.add({ kind, text: OPTIONS.find((o) => o.kind === kind)!.text, guess, when }))} />
    </FigmaScreen>
  );
}

/** 5.2 · How was it? — Figma node 120:2053 */
function Review({ a, onSaved }: { a: Activity; onSaved: () => void }) {
  const router = useRouter();
  const [actual, setActual] = useState(Math.min(10, a.guess + 3));
  const [mood, setMood] = useState("A bit lighter");
  const verdict = actual > a.guess ? "Low mood is good at predicting nothing will help. Your evidence says otherwise." : actual === a.guess ? "Your guess was spot on — that's useful to know too." : "Not every try lands, and that's still useful evidence. Next time, try another one.";
  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={() => router.push("/tools")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <div className="flex w-full justify-center">
        <Orb size={90} />
      </div>
      <h1 className="text-center type-flow-title text-forest">{OPTIONS.find((o) => o.kind === a.kind)?.done}</h1>
      <p className="text-center type-body-m text-t2">How much did it actually help?</p>
      <FigmaSlider label="Actually helped" valueText={`${actual} / 10`} fraction={actual / 10} min={0} max={10} step={1} value={actual} onChange={setActual} />
      <div className="flex w-full flex-col gap-2 rounded-[24px] border border-white p-4" style={{ backgroundImage: "linear-gradient(157.63deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
        <p className="type-label-s text-lime-deep">
          YOU GUESSED {a.guess}. IT WAS {actual}.
        </p>
        <p className="type-title-l text-forest">{verdict}</p>
      </div>
      <p className="type-label-m text-t2">Mood now</p>
      <div className="flex flex-wrap gap-2">
        {["A bit lighter", "Same", "Worse"].map((m) => (
          <SoftChip key={m} label={m} selected={mood === m} onClick={() => setMood(m)} />
        ))}
      </div>
      <Grow />
      <Pill
        label="Save to my evidence"
        className="w-full"
        onClick={() => {
          activities.update(a.id, { actual, mood, reviewedAt: new Date().toISOString() });
          onSaved();
        }}
      />
    </FigmaScreen>
  );
}

function ActivityPage() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const [list, setList] = useState<Activity[] | null>(null);
  useEffect(() => setList(activities.all()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration from device storage

  if (!list) return <FigmaScreen>{null}</FigmaScreen>;
  const review = params.get("step") === "review" ? list.find((a) => a.id === params.get("id")) : undefined;
  if (review)
    return (
      <Review
        a={review}
        onSaved={() => {
          toast.show("Saved to your evidence");
          router.push("/tools");
        }}
      />
    );
  return (
    <Plan
      list={list}
      onPlanned={(a) => {
        setList(activities.all());
        if (a.when === "Now") {
          router.push(`/tools/activity?step=review&id=${a.id}`);
          return;
        }
        toast.show(`Planned for ${a.when.toLowerCase()} · Evo will ask how it went`);
        router.push("/tools");
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense>
      <ActivityPage />
    </Suspense>
  );
}
