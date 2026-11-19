"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { BeforeAfter } from "@/components/chat/parts";
import { FigmaIcon, FigmaSlider, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { type Chat, useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { stepIdeas } from "@/lib/evo-engine";
import { balancedOptions, type Draft, loadDraft, loadRecords, peopleIn, saveDraft, saveRecord, spotTraps, TRAPS, trapHint, updateRecord } from "@/lib/thoughts";

const STEPS = ["situation", "emotions", "hot", "traps", "evidence", "balanced"] as const;
type Step = (typeof STEPS)[number] | "done";
const STEP_LABEL: Record<(typeof STEPS)[number], string> = { situation: "SITUATION", emotions: "EMOTIONS", hot: "THE HOT THOUGHT", traps: "THINKING TRAPS", evidence: "EVIDENCE", balanced: "BALANCED THOUGHT" };
const EMOTIONS = ["Hurt", "Guilty", "Angry", "Ashamed", "Sad", "Anxious"];
const BASE = "flex w-full shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]";
const CARD = `${BASE} border border-white bg-white/78`;

function whenNow(d = new Date()) {
  const t = d.toLocaleTimeString("en-US", { hour: "numeric" }).replace(" ", " ");
  return `${d.getHours() >= 18 ? "Tonight" : "Today"}, ${t}`;
}

/** First draft, filled from the chat it came from (or the latest chat with a thought). */
function fromChat(c: Chat | undefined): Draft {
  const said = c?.parts.find((p) => p.t === "me" && p.text.length > 12);
  const ev = c?.parts.find((p) => p.t === "evidence");
  const situation = said && "text" in said ? said.text : "";
  return {
    fromChat: c?.id,
    situation,
    when: whenNow(c ? new Date(c.startedAt) : new Date()),
    who: peopleIn(situation)[0],
    emotions: (c?.feelings ?? []).slice(0, 3).map((f) => ({ name: f.name, before: f.start })),
    hot: c?.thought ? `"${c.thought.replace(/[.!]+$/, "")}."` : "",
    belief: c?.belief?.[0] ?? 80,
    traps: [],
    supports: ev && ev.t === "evidence" ? ev.supports : [],
    against: ev && ev.t === "evidence" ? ev.against : [],
    balanced: "",
  };
}

function Progress({ step }: { step: (typeof STEPS)[number] }) {
  const n = STEPS.indexOf(step) + 1;
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full gap-[5px]" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s} className={cn("h-1.5 flex-1 rounded-[3px]", i >= n && "bg-line-strong")} style={i < n ? { backgroundImage: "linear-gradient(173.58deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined} />
        ))}
      </div>
      <p className="type-label-s text-lime-deep">
        THOUGHT RECORD · {n} OF 6 · {STEP_LABEL[step]}
      </p>
    </div>
  );
}

/** Dashed lime row: "Add more by voice" / "Say it in your own words". Dictates when the browser can, else focuses the field. */
function VoiceRow({ label, onText, fallback }: { label: string; onText: (t: string) => void; fallback: () => void }) {
  const [on, setOn] = useState(false);
  function go() {
    type SR = { start: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; lang: string };
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return fallback();
    const r = new Ctor();
    r.lang = "en-IN";
    r.onresult = (e) => onText(Array.from(e.results, (x) => x[0].transcript).join(" "));
    r.onend = () => setOn(false);
    setOn(true);
    r.start();
  }
  return (
    <button type="button" onClick={go} className="flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] border border-dashed border-lime bg-surface p-3 text-left">
      <FigmaIcon name="mic-limedeep-18" size={18} />
      <span className="flex-1 type-label-m text-lime-deep">{on ? "Listening…" : label}</span>
    </button>
  );
}

function QuoteRow({ text, on, tag, onClick }: { text: string; on: boolean; tag?: string; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cn(BASE, "cursor-pointer items-center gap-2.5 rounded-[18px] p-3.5 text-left", on ? "border-[1.5px] border-lime bg-lime-soft" : "border border-white bg-white/78")}>
      <FigmaIcon name={on ? "quote-limedeep-18" : "quote-t3-18"} size={18} />
      <span className="flex-1 type-label-m text-t1">{text}</span>
      {on && tag && <span className="rounded-full bg-peach-soft px-2 py-[3px] type-caption text-peach-text">{tag}</span>}
    </button>
  );
}

/** Before → after rows that can be re-rated by dragging (4.7). */
function Rerate({ label, before, after, onChange }: { label: string; before: number; after: number; onChange: (n: number) => void }) {
  return (
    <div className="relative">
      <BeforeAfter label={label} before={before} after={after} bar={10} />
      <input type="range" min={0} max={100} step={5} value={after} aria-label={`${label} now`} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-y-0 right-[70px] left-[80px] cursor-pointer opacity-0" />
    </div>
  );
}

function Shell({ step, title, sub, children, cta, onNext, disabled }: { step: (typeof STEPS)[number]; title: string; sub: ReactNode; children: ReactNode; cta?: string; onNext: () => void; disabled?: boolean }) {
  const router = useRouter();
  return (
    <FigmaScreen gap={step === "situation" ? 14 : 12} mood="calm">
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={() => router.push("/tools")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <Progress step={step} />
      <h1 className="type-flow-title text-forest">{title}</h1>
      <p className="type-body-m text-t2">{sub}</p>
      {children}
      <Grow />
      <Pill label={cta ?? "Next"} className="w-full" disabled={disabled} onClick={onNext} />
    </FigmaScreen>
  );
}

/** 4.2–4.8 · Thought record — Figma nodes 118:1941 … 119:2132 */
function ThoughtRecord() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const step = (params.get("step") as Step) || "situation";
  const { chats, ready } = useChats();
  const [d, setD] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [own, setOwn] = useState<string | null>(null);
  const [adding, setAdding] = useState<"supports" | "against" | null>(null);
  const [addText, setAddText] = useState("");
  const situationRef = useRef<HTMLTextAreaElement>(null);
  const ownRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ready || d) return;
    const rec = params.get("step") === "done" ? loadRecords().find((r) => r.id === params.get("id")) : undefined;
    const chatId = params.get("chat");
    const source = chatId ? chats.find((c) => c.id === chatId) : chats.find((c) => c.thought);
    setD(rec ?? loadDraft() ?? fromChat(source)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration from device storage
  }, [ready, d, chats, params]);

  useEffect(() => {
    if (d) saveDraft(d);
  }, [d]);

  if (!d) return <FigmaScreen mood="calm">{null}</FigmaScreen>;
  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch });
  const go = (s: Step) => router.push(`/tools/thought-record?step=${s}`);

  if (step === "situation") {
    const people = peopleIn(d.situation);
    return (
      <Shell step="situation" title="What happened?" sub={d.fromChat ? "Just the facts, like a camera would see it. Evo filled this from your chat — change anything." : "Just the facts, like a camera would see it."} onNext={() => go("emotions")} disabled={!d.situation.trim()}>
        <label className={cn(CARD, "flex-col gap-2 rounded-[22px] p-4")}>
          <span className="flex w-full items-center">
            <span className="flex-1 type-label-s text-t3">THE SITUATION</span>
            <FigmaIcon name="pencil-t3-16" size={16} />
          </span>
          <textarea ref={situationRef} value={d.situation} onChange={(e) => set({ situation: e.target.value })} rows={4} placeholder="Where were you, who was there, what was said?" className="w-full resize-none bg-transparent type-title-l text-forest outline-none placeholder:text-t3" />
        </label>
        <SectionLabel>WHEN</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {[whenNow(), "Earlier"].map((w) => (
            <SoftChip key={w} label={w} selected={d.when === w} onClick={() => set({ when: w })} />
          ))}
        </div>
        <SectionLabel>WHO WAS THERE</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {people.map((p) => (
            <SoftChip key={p} label={p} selected={d.who === p} onClick={() => set({ who: p })} />
          ))}
        </div>
        <Grow />
        <VoiceRow label="Add more by voice" onText={(t) => set({ situation: `${d.situation} ${t}`.trim() })} fallback={() => situationRef.current?.focus()} />
      </Shell>
    );
  }

  if (step === "emotions") {
    const names = [...new Set([...d.emotions.map((e) => e.name), ...EMOTIONS])].slice(0, 8);
    const toggle = (n: string) => set({ emotions: d.emotions.some((e) => e.name === n) ? d.emotions.filter((e) => e.name !== n) : [...d.emotions, { name: n, before: 60 }] });
    return (
      <Shell step="emotions" title="What did you feel?" sub="Pick all that fit, then how strong each one was." onNext={() => go("hot")} disabled={!d.emotions.length}>
        <div className="flex flex-wrap gap-2">
          {names.map((n) => (
            <SoftChip key={n} label={n} selected={d.emotions.some((e) => e.name === n)} onClick={() => toggle(n)} />
          ))}
        </div>
        {d.emotions.map((e) => (
          <FigmaSlider key={e.name} label={e.name} valueText={String(e.before)} fraction={e.before / 100} min={0} max={100} step={5} value={e.before} onChange={(v) => set({ emotions: d.emotions.map((x) => (x.name === e.name ? { ...x, before: v } : x)) })} />
        ))}
      </Shell>
    );
  }

  if (step === "hot") {
    const who = d.who && !["Family", "Alone", "Friends"].includes(d.who) ? d.who : "them";
    const her = /amma|mum|mom|mother|sister/i.test(who) ? "her" : /dad|achan|appa|father|brother/i.test(who) ? "him" : "them";
    const options = [...new Set([d.hot, `"I'm never good enough for ${her}."`, `"${her === "them" ? "They don't" : her === "her" ? "She doesn't" : "He doesn't"} care how I feel."`, `"I ruin everything."`].filter(Boolean))].slice(0, 3);
    return (
      <Shell step="hot" title="What went through your mind?" sub={'Pick the thought that stings the most — the "hot" one.'} onNext={() => go("traps")} disabled={!d.hot}>
        <div role="radiogroup" aria-label="Hot thought" className="flex w-full flex-col gap-3">
          {options.map((o) => (
            <QuoteRow key={o} text={o} on={d.hot === o} tag="hot" onClick={() => set({ hot: o, traps: spotTraps(o, d.situation) })} />
          ))}
          {own !== null && <QuoteRow text={`"${own}"`} on={d.hot === `"${own}"`} tag="hot" onClick={() => set({ hot: `"${own}"` })} />}
        </div>
        {own === null ? (
          <VoiceRow
            label="Say it in your own words"
            onText={(t) => {
              setOwn(t);
              set({ hot: `"${t}"`, traps: spotTraps(t, d.situation) });
            }}
            fallback={() => setOwn("")}
          />
        ) : (
          <input
            ref={ownRef}
            autoFocus
            value={own}
            onChange={(e) => {
              setOwn(e.target.value);
              set({ hot: `"${e.target.value}"`, traps: spotTraps(e.target.value, d.situation) });
            }}
            placeholder="The thought, in your words"
            aria-label="Your thought"
            className="h-12 w-full rounded-[18px] border border-dashed border-lime bg-surface px-3 type-label-m text-t1 outline-none"
          />
        )}
        <FigmaSlider label="How much do you believe it?" valueText={`${d.belief}%`} fraction={d.belief / 100} min={0} max={100} step={5} value={d.belief} onChange={(v) => set({ belief: v })} />
      </Shell>
    );
  }

  if (step === "traps") {
    const toggle = (n: string) => set({ traps: d.traps.includes(n) ? d.traps.filter((t) => t !== n) : [...d.traps, n] });
    return (
      <Shell step="traps" title="Spot the thinking traps" sub={`${d.hot} Do any of these fit?`} onNext={() => go("evidence")}>
        <div role="group" aria-label="Thinking traps" className="flex w-full flex-col gap-3">
          {TRAPS.map((t) => {
            const on = d.traps.includes(t.name);
            return (
              <button key={t.name} type="button" aria-pressed={on} onClick={() => toggle(t.name)} className={cn(BASE, "cursor-pointer items-center gap-3 rounded-[18px] border p-3 text-left", on ? "border-lavender-text bg-lavender-soft" : "border-white bg-white/78")}>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="type-label-m text-t1">{t.name}</span>
                  <span className="type-caption text-t2">{t.name === "Mind reading" && d.who && !["Family", "Alone", "Friends"].includes(d.who) ? `Guessing what ${/amma|mum|mom|mother|sister/i.test(d.who) ? "she thinks" : "they think"} of you` : t.note}</span>
                </span>
                {on && <FigmaIcon name="check-lav-20" size={20} />}
              </button>
            );
          })}
        </div>
        <div className="flex w-full items-center gap-2.5 rounded-[16px] bg-lime-soft p-3">
          <Orb size={28} />
          <p className="flex-1 type-body-s text-forest">{trapHint(d.hot)}</p>
        </div>
      </Shell>
    );
  }

  if (step === "evidence") {
    const move = (from: "supports" | "against", i: number) => {
      const to = from === "supports" ? "against" : "supports";
      set({ [from]: d[from].filter((_, j) => j !== i), [to]: [...d[to], d[from][i]] } as Partial<Draft>);
    };
    const add = () => {
      if (adding && addText.trim()) set({ [adding]: [...d[adding], addText.trim()] } as Partial<Draft>);
      setAdding(null);
      setAddText("");
    };
    const col = (key: "supports" | "against") => {
      const peach = key === "supports";
      return (
        <div className={cn("flex flex-1 flex-col gap-2 self-stretch rounded-[20px] p-3", peach ? "bg-peach-soft" : "bg-lime-soft")}>
          <p className={cn("type-label-s", peach ? "text-peach-text" : "text-lime-deep")}>{peach ? "SUPPORTS IT" : "DOESN'T FIT"}</p>
          {d[key].map((t, i) => (
            <button key={`${t}${i}`} type="button" onClick={() => move(key, i)} aria-label={`${t} — move to ${peach ? "doesn't fit" : "supports it"}`} className="w-full cursor-pointer rounded-[14px] bg-surface p-2.5 text-left type-body-s text-t1">
              {t}
            </button>
          ))}
          {adding === key ? (
            <input autoFocus value={addText} onChange={(e) => setAddText(e.target.value)} onBlur={add} onKeyDown={(e) => e.key === "Enter" && add()} aria-label={peach ? "Add something that supports it" : "Add something that doesn't fit"} className="w-full rounded-[14px] bg-surface p-2.5 type-body-s text-t1 outline-none" />
          ) : (
            <button type="button" onClick={() => setAdding(key)} className={cn("flex w-full cursor-pointer items-center gap-1.5 rounded-[14px] border border-dashed p-2", peach ? "border-peach-text" : "border-lime-deep")}>
              <FigmaIcon name={peach ? "plus-peach-14" : "plus-limedeep-14"} size={14} />
              <span className={cn("type-caption", peach ? "text-peach-text" : "text-lime-deep")}>Add</span>
            </button>
          )}
        </div>
      );
    };
    return (
      <Shell step="evidence" title="What fits — and what doesn't?" sub="Tap to move cards, or add your own." onNext={() => go("balanced")}>
        <div className="flex w-full items-start gap-2.5">
          {col("supports")}
          {col("against")}
        </div>
        <div className={cn(CARD, "flex-col gap-1.5 rounded-[18px] p-3.5")}>
          <p className="type-label-s text-t3">ASK YOURSELF</p>
          <p className="type-label-m text-t1">What would you tell a friend who had this thought?</p>
        </div>
      </Shell>
    );
  }

  if (step === "balanced") {
    const options = balancedOptions(d.hot, d.against, d.who);
    const after = d.beliefAfter ?? Math.max(0, d.belief - 40);
    return (
      <Shell
        step="balanced"
        title="A kinder, truer thought"
        sub="Pick one that feels believable, or say your own."
        cta="Save"
        disabled={!d.balanced}
        onNext={() => {
          const r = saveRecord({ ...d, beliefAfter: after, emotions: d.emotions.map((e) => ({ ...e, after: e.after ?? Math.max(0, e.before - 30) })) });
          setSaved(r.id);
          setD(r);
          router.push(`/tools/thought-record?step=done&id=${r.id}`);
        }}
      >
        <div role="radiogroup" aria-label="Balanced thought" className="flex w-full flex-col gap-3">
          {options.map((o) => (
            <QuoteRow key={o} text={o} on={d.balanced === o} onClick={() => set({ balanced: o })} />
          ))}
          {own !== null && own !== "" && <QuoteRow text={`"${own}"`} on={d.balanced === `"${own}"`} onClick={() => set({ balanced: `"${own}"` })} />}
        </div>
        {own === null ? (
          <VoiceRow
            label="Say your own"
            onText={(t) => {
              setOwn(t);
              set({ balanced: `"${t}"` });
            }}
            fallback={() => setOwn("")}
          />
        ) : (
          own === "" && (
            <input
              autoFocus
              onKeyDown={(e) => {
                const v = (e.target as HTMLInputElement).value.trim();
                if (e.key !== "Enter" || !v) return;
                setOwn(v);
                set({ balanced: `"${v}"` });
              }}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (!v) return;
                setOwn(v);
                set({ balanced: `"${v}"` });
              }}
              placeholder="A kinder, truer way to say it"
              aria-label="Your balanced thought"
              className="h-12 w-full rounded-[18px] border border-dashed border-lime bg-surface px-3 type-label-m text-t1 outline-none"
            />
          )
        )}
        <div className={cn(CARD, "flex-col gap-2.5 rounded-[20px] p-3.5")}>
          <p className="type-label-s text-t3">RE-RATE</p>
          <Rerate label="Belief" before={d.belief} after={after} onChange={(n) => set({ beliefAfter: n })} />
          {d.emotions.map((e) => (
            <Rerate key={e.name} label={e.name} before={e.before} after={e.after ?? Math.max(0, e.before - 30)} onChange={(n) => set({ emotions: d.emotions.map((x) => (x.name === e.name ? { ...x, after: n } : x)) })} />
          ))}
        </div>
      </Shell>
    );
  }

  // 4.8 · You shifted it
  const id = params.get("id") ?? saved;
  const top = [...d.emotions].sort((a, b) => b.before - a.before)[0];
  const after = d.beliefAfter ?? d.belief;
  const lighter = after < d.belief;
  const step1 = stepIdeas({ topic: d.who && !["Family", "Alone", "Friends"].includes(d.who) ? `fight with ${d.who}` : d.situation, thought: d.hot })[0].text;
  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <button type="button" aria-label="Close" onClick={() => router.push("/tools")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <div className="flex w-full justify-center">
        <Orb size={96} />
      </div>
      <h1 className="text-center type-flow-title text-forest">{lighter ? "That thought got lighter." : "You looked at it honestly."}</h1>
      <p className="text-center type-body-m text-t2">
        {lighter ? `From ${d.belief}% to ${after}% believable.` : `Still ${after}% believable — and that's okay.`}
        {top && top.after !== undefined && top.after < top.before ? ` The ${top.name.toLowerCase()} came down too.` : ""}
      </p>
      <div className="flex w-full flex-col gap-2.5 rounded-[24px] border border-white p-4" style={{ backgroundImage: "linear-gradient(149.65deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
        <p className="type-label-s text-t3">OLD THOUGHT</p>
        <p className="type-body-m text-t3">{d.hot}</p>
        <p className="type-label-s text-lime-deep">NEW THOUGHT</p>
        <p className="type-title-l text-forest">{d.balanced}</p>
      </div>
      <p className="type-label-m text-t2">Want to do one small thing with it?</p>
      <div className="flex flex-wrap gap-2">
        <SoftChip label={step1[0].toUpperCase() + step1.slice(1)} selected onClick={() => router.push(d.fromChat ? `/chat/step?id=${d.fromChat}` : `/chat/live?mode=talk&q=${encodeURIComponent(`I want to ${step1.toLowerCase()}`)}`)} />
        <SoftChip
          label="Save to journal"
          onClick={() => {
            if (id) updateRecord(id, { journal: true });
            toast.show("Saved to your journal");
          }}
        />
        <SoftChip label={new Date().getHours() >= 18 ? "Done for tonight" : "Done for now"} onClick={() => router.push("/tools")} />
      </div>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ThoughtRecord />
    </Suspense>
  );
}
