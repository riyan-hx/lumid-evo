"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FigmaIcon, FigmaSlider, FlowHeader, GlassCard, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useCheckIns, type CheckIn } from "@/lib/checkins";
import { cn } from "@/lib/cn";
import { BODY, BODY_SPOTS, CAUSES, ENERGY, ENERGY_FILL, FEELINGS } from "@/lib/feelings";
import { decide, type Decision } from "@/lib/router";

type Step = "feel" | "name" | "body" | "cause" | "reflect";
type Draft = { feeling: string; energy: number; word: string; intensity: number; body: string[]; spot: string; causes: string[] };
const EMPTY: Draft = { feeling: "", energy: 1, word: "", intensity: 50, body: [], spot: "", causes: [] };
const DRAFT_KEY = "evo.checkin.draft";
const title = { fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.7px" } as const;

/** 2.2–2.6 · Classic check-in — Figma nodes 114:1623, 114:1727, 114:1795, 115:1608, 115:1672. Step lives in the URL. */
function ClassicCheckIn() {
  const router = useRouter();
  const step = (useSearchParams().get("step") as Step) || "feel";
  const { items, add } = useCheckIns();
  const toast = useToast();
  const [d, setD] = useState<Draft>(EMPTY);
  const [result, setResult] = useState<{ item: CheckIn; decision: Decision } | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setD(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect -- restore draft once
    } catch {}
  }, []);
  const patch = (p: Partial<Draft>) =>
    setD((prev) => {
      const next = { ...prev, ...p };
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  const go = (s: Step) => router.push(`/check-in?step=${s}`);
  const clearDraft = () => {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
  };
  const close = () => {
    clearDraft();
    router.push("/home");
  };
  const feeling = FEELINGS.find((f) => f.name === d.feeling);
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function save() {
    const item = add({ style: "classic", feeling: d.feeling, word: d.word, intensity: d.intensity, energy: d.energy, body: d.body, causes: d.causes });
    const decision = decide(item, items);
    setResult({ item, decision });
    clearDraft();
    if (decision.safety) router.push("/check-in/low");
    else go("reflect");
  }

  /* ---------- 2.2 How are you feeling ---------- */
  if (step === "feel")
    return (
      <FigmaScreen gap={14} mood="calm">
        <FlowHeader icon="close" label="Close check-in" title="Check-in" sub="1 of 3 · about 10 seconds" onClick={close} />
        <div className="flex w-full justify-center">
          <Orb size={96} />
        </div>
        <h1 className="text-center font-medium text-forest" style={title}>
          How are you feeling right now?
        </h1>
        <div role="radiogroup" aria-label="Feeling" className="grid w-full grid-cols-4 gap-2">
          {FEELINGS.map((f) => {
            const on = d.feeling === f.name;
            return (
              <button
                key={f.name}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => patch({ feeling: f.name, word: "" })}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-[18px] p-2.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
                  on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78",
                )}
              >
                <Tile size={34} radius={11} bg={f.bg}>
                  <FigmaIcon name={f.icon} size={18} />
                </Tile>
                <span className="text-center type-caption whitespace-nowrap text-t1">{f.name}</span>
              </button>
            );
          })}
        </div>
        <FigmaSlider
          label="Energy"
          valueText={ENERGY[d.energy]}
          fraction={ENERGY_FILL[d.energy]}
          min={0}
          max={4}
          step={1}
          value={d.energy}
          onChange={(v) => patch({ energy: v })}
        />
        <Grow />
        <Pill label="Next" className="w-full" onClick={() => d.feeling && go("name")} />
      </FigmaScreen>
    );

  /* ---------- 2.3 Name it precisely ---------- */
  if (step === "name") {
    const word = d.word || "";
    return (
      <FigmaScreen gap={14} mood="calm">
        <FlowHeader icon="chevron-left" label="Back" title="Check-in" sub="2 of 3" onClick={() => go("feel")} />
        <h1 className="font-medium text-forest" style={title}>
          {d.feeling || "Feeling"} — which word fits best?
        </h1>
        <p className="type-body-m text-t2">Naming a feeling precisely can make it a little smaller.</p>
        <div className="flex w-full flex-wrap gap-2">
          {feeling?.words.map((w) => <SoftChip key={w} label={w} selected={word === w} onClick={() => patch({ word: word === w ? "" : w })} />)}
        </div>
        <FigmaSlider
          label="How strong is it?"
          valueText={`${d.intensity} / 100`}
          ariaValueText={`${d.intensity} out of 100`}
          fraction={d.intensity / 100}
          min={0}
          max={100}
          step={5}
          value={d.intensity}
          onChange={(v) => patch({ intensity: v })}
        />
        <GlassCard>
          <Orb size={36} />
          <p className="flex-1 type-body-s text-t1">
            {word ? `${word[0].toUpperCase()}${word.slice(1)}` : d.feeling}, {d.intensity} out of 100.{" "}
            {d.intensity >= 60 ? "That's a lot to hold — thank you for naming it." : "Thank you for naming it."}
          </p>
        </GlassCard>
        <Grow />
        <Pill label="Next" className="w-full" onClick={() => go("body")} />
      </FigmaScreen>
    );
  }

  /* ---------- 2.4 Where in your body ---------- */
  if (step === "body") {
    const active = BODY_SPOTS.find((s) => s.id === d.spot);
    const pickSpot = (id: string, chip: string) => patch({ spot: d.spot === id ? "" : id, body: d.spot === id ? d.body.filter((b) => b !== chip) : Array.from(new Set([...d.body, chip])) });
    return (
      <FigmaScreen gap={14} mood="calm">
        <FlowHeader icon="chevron-left" label="Back" title="Check-in" sub="3 of 3 · optional" onClick={() => go("name")} />
        <h1 className="font-medium text-forest" style={title}>
          Where do you feel it?
        </h1>
        <p className="type-body-m text-t2">Tap a spot, or skip.</p>
        <div className="relative h-[260px] w-full overflow-hidden rounded-[28px] bg-white/60">
          <div className="absolute inset-y-0 left-1/2 w-[345px] -translate-x-1/2">
            {/* eslint-disable @next/next/no-img-element -- Figma body-map artwork */}
            <img src="/figma/body/head.svg" alt="" width={56} height={64} className="absolute" style={{ left: 145, top: 18 }} />
            <div className="absolute h-[156px] w-[116px] rounded-[50px] bg-lavender-soft" style={{ left: 115, top: 88 }} />
            {BODY_SPOTS.map((s) => {
              const on = d.spot === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.label}
                  aria-pressed={on}
                  onClick={() => pickSpot(s.id, s.chip)}
                  className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
                  style={{ left: s.x, top: s.y }}
                >
                  {on ? (
                    <img src="/figma/body/spot-active.svg" alt="" width={70} height={70} className="max-w-none" />
                  ) : (
                    <img src={`/figma/body/${s.dot}.svg`} alt="" width={s.size} height={s.size} />
                  )}
                </button>
              );
            })}
            {/* eslint-enable @next/next/no-img-element */}
            {active && (
              <span
                className="pointer-events-none absolute rounded-full px-2.5 py-1.5 type-caption text-white"
                style={{ left: active.x + 27, top: active.y - 12, backgroundImage: "linear-gradient(152.05deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}
              >
                {active.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2">
          {BODY.map((b) => (
            <SoftChip key={b} label={b} selected={d.body.includes(b)} onClick={() => patch({ body: toggle(d.body, b) })} />
          ))}
        </div>
        <Grow />
        <Pill label="Done" className="w-full" onClick={() => go("cause")} />
        <button type="button" onClick={() => go("cause")} className="cursor-pointer text-center type-label-m text-t2">
          Skip this step
        </button>
      </FigmaScreen>
    );
  }

  /* ---------- 2.5 What's behind it ---------- */
  if (step === "cause")
    return (
      <FigmaScreen gap={14} mood="calm">
        <FlowHeader icon="chevron-left" label="Back" title="Check-in" sub="Optional" onClick={() => go("body")} />
        <h1 className="font-medium text-forest" style={title}>
          What&apos;s behind it?
        </h1>
        <p className="type-body-m text-t2">Pick any. Or just say it.</p>
        <div className="flex w-full flex-wrap gap-2">
          {CAUSES.map((c) => (
            <SoftChip key={c} label={c} selected={d.causes.includes(c)} onClick={() => patch({ causes: toggle(d.causes, c) })} />
          ))}
        </div>
        <div className="flex w-full flex-col items-center gap-3 rounded-[24px] p-4" style={{ backgroundImage: "linear-gradient(156.22deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
          <Link
            href="/voice?from=checkin"
            aria-label="Hold to say more"
            className="flex size-16 items-center justify-center rounded-[32px] shadow-[0_10px_20px_rgba(21,26,19,0.3)]"
            style={{ backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}
          >
            <FigmaIcon name="mic-forest-28" size={28} />
          </Link>
          <p className="w-[280px] text-center type-body-s text-lime-soft">Hold to say more — in English or Malayalam</p>
          <p className="w-[280px] text-center type-caption text-lime">Only the text is kept. You&apos;ll see it before it&apos;s saved.</p>
        </div>
        <Grow />
        <Pill label="Save check-in" className="w-full" onClick={() => d.feeling && save()} />
      </FigmaScreen>
    );

  /* ---------- 2.6 Evo reflects (or the safety-aware response) ---------- */
  const r = result ?? (items[0] ? { item: items[0], decision: decide(items[0], items.slice(1)) } : null);
  if (!r) {
    return (
      <FigmaScreen gap={14}>
        <FlowHeader icon="close" label="Close" title="Check-in" sub="" onClick={close} />
        <Pill label="Start a check-in" className="w-full" onClick={() => go("feel")} />
      </FigmaScreen>
    );
  }
  if (r.decision.safety) {
    // Reached via Back/refresh: the safety screen owns this state (no reflection for very low check-ins).
    return (
      <FigmaScreen gap={14}>
        <Pill label="Continue" href="/check-in/low" className="w-full" />
      </FigmaScreen>
    );
  }
  const { item, decision } = r;
  const chips = [
    { text: `${item.feeling}${item.word ? ` · ${item.word}` : ""}`, cls: "bg-sky-soft text-sky-text" },
    { text: `${item.intensity} / 100`, cls: "bg-peach-soft text-peach-text" },
    ...(item.body?.length ? [{ text: item.body.map((b) => b[0].toUpperCase() + b.slice(1)).join(" · "), cls: "bg-lavender-soft text-lavender-text" }] : []),
    ...(item.causes?.length ? [{ text: item.causes.join(" · "), cls: "bg-sun-soft text-sun-text" }] : []),
  ];
  const ICONS: Record<string, { icon: string; bg: string }> = {
    breathe: { icon: "wind-sky-19", bg: "bg-sky-soft" },
    thought: { icon: "brain-lav-19", bg: "bg-lavender-soft" },
    talk: { icon: "chat-limedeep-19", bg: "bg-lime-soft" },
    soothe: { icon: "heart-lav", bg: "bg-lavender-soft" },
  };
  const lead =
    decision.rule === "2-arousal"
      ? `When ${item.feeling.toLowerCase()} is at ${item.intensity}, calming the body first helps. Then we can look at the thought behind it.`
      : decision.rule === "6-low"
        ? "You don't have to fix anything right now. Talking it through can make it lighter."
        : "Here are a few gentle next steps. Pick one, or none.";

  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={close} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <div className="flex w-full justify-center">
        <Orb size={80} />
      </div>
      <h1 className="text-center font-medium text-forest" style={title}>
        Thanks for checking in.
      </h1>
      <div className="flex w-full flex-col items-start gap-2 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <p className="type-label-s text-t3">RIGHT NOW</p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c.text} className={cn("rounded-full px-2.5 py-1.5 type-label-s", c.cls)}>
              {c.text}
            </span>
          ))}
        </div>
      </div>
      <p className="type-body-m text-t2">{lead}</p>
      {decision.suggestions.map((s) => {
        const ic = ICONS[s.id] ?? ICONS.talk;
        return (
          <Link key={s.id} href={s.href} data-rule={decision.rule} className="w-full">
            <GlassCard className={cn("rounded-[18px] p-3", s.recommended && "border-[1.5px] border-lime bg-lime-soft")}>
              <Tile size={36} radius={12} bg={ic.bg}>
                <FigmaIcon name={ic.icon} size={19} />
              </Tile>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="type-label-m text-t1">{s.title}</p>
                <p className="type-caption text-t3">{s.note}</p>
              </div>
              <FigmaIcon name="chevron-right" size={18} />
            </GlassCard>
          </Link>
        );
      })}
      <Grow />
      <button
        type="button"
        className="cursor-pointer text-center type-label-m text-t2"
        onClick={() => {
          toast.show("Saved to your journal");
          router.push("/home");
        }}
      >
        That&apos;s enough for now
      </button>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ClassicCheckIn />
    </Suspense>
  );
}
