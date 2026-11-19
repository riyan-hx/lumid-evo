"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/motion";

/* ───────────── header & bubbles (X3) ───────────── */

const ROUND_BTN = "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] border backdrop-blur-[12px]";

export function ChatHeader({ sub, onBack, onMore, dark, backIcon = "chevron-left", title = "Evo", orb = true, trailing }: { sub: string; onBack: () => void; onMore?: () => void; dark?: boolean; backIcon?: "chevron-left" | "close"; title?: string; orb?: boolean; trailing?: ReactNode }) {
  const btn = cn(ROUND_BTN, dark ? "border-white/20 bg-white/12" : "border-white bg-surface");
  return (
    <div className="flex w-full items-center gap-2.5">
      <button type="button" aria-label={backIcon === "close" ? "Close" : "Back"} onClick={onBack} className={btn}>
        <FigmaIcon name={dark ? "chevron-left-white" : backIcon} size={20} />
      </button>
      {orb && <Orb size={32} />}
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <p className={cn("type-label-m", dark ? "text-white" : "text-t1")}>{title}</p>
        <p className={cn("truncate type-caption", dark ? "text-lime" : "text-t3")}>{sub}</p>
      </div>
      {trailing}
      {!trailing && onMore && (
        <button type="button" aria-label="More options" onClick={onMore} className={btn}>
          <FigmaIcon name={dark ? "more-white-20" : "more-20"} size={20} />
        </button>
      )}
    </div>
  );
}

/** Evo's message: 24 px orb + bubble (radius 6/20/20/20). Long-press (or right-click) opens message actions (X7). */
export function EvoBubble({ children, dark, onLongPress }: { children: ReactNode; dark?: boolean; onLongPress?: (rect: DOMRect) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fire = () => ref.current && onLongPress?.(ref.current.getBoundingClientRect());
  return (
    <div className="flex w-full items-start gap-2">
      <Orb size={24} />
      <div
        ref={ref}
        onContextMenu={(e) => {
          if (!onLongPress) return;
          e.preventDefault();
          fire();
        }}
        onPointerDown={() => {
          if (onLongPress) timer.current = setTimeout(fire, 500);
        }}
        onPointerUp={() => clearTimeout(timer.current)}
        onPointerLeave={() => clearTimeout(timer.current)}
        className={cn(
          "max-w-[313px] rounded-[20px] rounded-tl-[6px] border px-3.5 py-2.5 type-body-m select-none",
          dark ? "border-white/18 bg-white/10 text-white" : "border-line-strong bg-surface text-t1 shadow-[0_6px_16px_rgba(21,26,19,0.06)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function MeBubble({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex w-full justify-end">
      <div className={cn("max-w-[278px] rounded-[20px] rounded-br-[6px] px-3.5 py-2.5 type-body-m", dark ? "text-forest" : "text-white")} style={{ backgroundImage: dark ? "var(--gradient-lime)" : "var(--gradient-forest)" }}>
        {children}
      </div>
    </div>
  );
}

/** Evo is typing: 53×27 pill with three 7 px dots (X3). */
export function Typing({ dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" role="status" aria-label="Evo is typing">
      <Orb size={24} state="thinking" />
      <div className={cn("flex h-[27px] w-[53px] items-center justify-center gap-1 rounded-[13.5px]", dark ? "bg-white/10" : "bg-surface")}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("evo-typing-dot size-[7px] rounded-full", dark ? "bg-white/60" : "bg-t3")} style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
    </div>
  );
}

export function ChipRow({ options, picked, onPick, indent }: { options: string[]; picked?: string; onPick: (v: string) => void; indent?: boolean }) {
  return (
    <div className={cn("flex w-full flex-wrap gap-2", indent && "pl-[34px]")}>
      {options.map((o) => (
        <SoftChip key={o} label={o} selected={picked === o} onClick={() => !picked && onPick(o)} className={picked && picked !== o ? "pointer-events-none" : undefined} />
      ))}
    </div>
  );
}

/* ───────────── composer ───────────── */

type SR = { start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; lang: string; interimResults: boolean };

export function Composer({ placeholder, onSend, onPlus, dark, autoFocus, sticky = true }: { placeholder: string; onSend: (text: string) => void; onPlus?: () => void; dark?: boolean; autoFocus?: boolean; sticky?: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const rec = useRef<SR | null>(null);

  function send() {
    const t = text.trim();
    if (!t) return;
    haptic("light");
    onSend(t);
    setText("");
  }

  function dictate() {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return void router.push("/voice");
    if (listening) return rec.current?.stop();
    const r = new Ctor();
    r.lang = "en-IN";
    r.interimResults = true;
    r.onresult = (e) => setText(Array.from(e.results, (x) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  }

  const sub = dark ? "bg-white/12" : "bg-subtle";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className={cn(
        "z-10 flex w-full shrink-0 items-center",
        sticky && "sticky bottom-7",
        "gap-2 rounded-full border py-1.5 pr-1.5 pl-2.5 backdrop-blur-[12px]",
        dark ? "border-white/20 bg-white/10" : "border-lime-soft bg-surface shadow-[0_10px_24px_rgba(21,26,19,0.08)]",
      )}
    >
      <button type="button" aria-label="More ways to talk" onClick={onPlus} className={cn("flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[18px]", sub)}>
        <FigmaIcon name={dark ? "plus-white-18" : "plus-18"} size={18} />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={listening ? "Listening…" : placeholder}
        aria-label="Message Evo"
        autoFocus={autoFocus}
        enterKeyHint="send"
        className={cn("min-w-0 flex-1 bg-transparent type-body-m outline-none", dark ? "text-white placeholder:text-white/60" : "text-t1 placeholder:text-t3")}
      />
      <button type="button" aria-label={listening ? "Stop dictation" : "Speak instead"} aria-pressed={listening} onClick={dictate} className={cn("flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[20px]", listening ? "bg-lime-soft" : sub)}>
        <FigmaIcon name={dark ? "mic-white-18" : "mic-18"} size={18} />
      </button>
      <button type="submit" aria-label="Send" className={cn("flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[20px]", !dark && "bg-ink")} style={dark ? { backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}>
        <FigmaIcon name={dark ? "send-forest-18" : "send-white-18"} size={18} />
      </button>
    </form>
  );
}

/* ───────────── inline widgets ───────────── */

/** X3 · "How strong is it?" — sky track, lime fill, deep knob. Commits once, on release / Enter. */
export function ChatSlider({ label, value, done, onCommit }: { label: string; value: number; done?: boolean; onCommit: (v: number) => void }) {
  const [v, setV] = useState(value);
  const commit = () => !done && onCommit(v);
  return (
    <div className="flex w-full flex-col gap-2 rounded-[18px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      <div className="flex items-center">
        <p className="flex-1 type-label-m text-t1">{label}</p>
        <p className="type-title-m text-lime-deep">{v}</p>
      </div>
      <div className="relative h-[22px] w-full">
        <div className="absolute top-[7px] h-2 w-full rounded-[4px] bg-sky-soft" />
        <div className="absolute top-[7px] h-2 rounded-[4px]" style={{ width: `${v}%`, backgroundImage: "linear-gradient(177.78deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma knob */}
        <img src="/figma/chat/knob-deep.svg" alt="" aria-hidden width={22} height={22} className="pointer-events-none absolute top-0" style={{ left: `calc(${v}% - ${(v / 100) * 22}px)` }} />
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={v}
          disabled={done}
          aria-label={label}
          onChange={(e) => setV(Number(e.target.value))}
          onPointerUp={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          onBlur={commit}
          className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-default"
        />
      </div>
    </div>
  );
}

/** 3.1 · tap-to-answer rows. */
export function OptionRows({ options, picked, onPick }: { options: string[]; picked?: string; onPick: (v: string) => void }) {
  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={!!picked}
          onClick={() => onPick(o)}
          className={cn("flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] border border-white bg-white/78 p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px] disabled:cursor-default", picked && picked !== o && "opacity-50")}
        >
          <span className="flex-1 type-label-m text-t1">{o}</span>
          <FigmaIcon name="chevron-right-16" size={16} />
        </button>
      ))}
    </div>
  );
}

/** 3.1 · 0–10 scale: cells below the pick lime-soft, pick forest, above subtle. */
export function ScaleRow({ label, picked, onPick }: { label: string; picked?: number; onPick: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-1 rounded-[18px] border border-white bg-white/78 p-2.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      {Array.from({ length: 11 }, (_, n) => {
        const on = picked === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={picked !== undefined}
            onClick={() => onPick(n)}
            className={cn("flex h-[30px] flex-1 cursor-pointer items-center justify-center rounded-[10px] type-caption disabled:cursor-default", on ? "text-white" : "text-t2", picked !== undefined && n < picked ? "bg-lime-soft" : !on && "bg-subtle")}
            style={on ? { backgroundImage: "linear-gradient(130.6deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" } : undefined}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

const PHASES = ["Breathe in", "Hold", "Breathe out", "Hold"] as const;

/** X4 · Box breathing inside the chat: 60 s, 4-4-4-4. */
export function BreathCard({ done, last, onDone }: { done?: boolean; last?: string; onDone: (skipped: boolean) => void }) {
  const [left, setLeft] = useState(60);
  const [paused, setPaused] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    if (done || paused) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [done, paused]);

  useEffect(() => {
    if (left === 0 && !done && !finished.current) {
      finished.current = true;
      haptic("success");
      onDone(false);
    }
  }, [left, done, onDone]);

  const elapsed = 60 - left;
  const phase = Math.floor(elapsed / 4) % 4;
  const count = 4 - (elapsed % 4);
  const scale = done ? 1 : phase === 0 ? 0.82 + (elapsed % 4) * 0.06 : phase === 1 ? 1 : phase === 2 ? 1 - (elapsed % 4) * 0.06 : 0.82;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col items-center gap-3 rounded-[24px] border border-white bg-surface p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <div className="flex w-full items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[11px] bg-mint-soft">
            <FigmaIcon name="wind-mint-17" size={17} />
          </span>
          <div className="flex flex-1 flex-col gap-px">
            <p className="type-label-m text-t1">Box breathing</p>
            <p className="type-caption text-t3">4 in · 4 hold · 4 out · 4 hold</p>
          </div>
          <p className="type-label-m text-t2 tabular-nums" aria-live="off">
            {done ? "Done" : `0:${String(left).padStart(2, "0")}`}
          </p>
        </div>
        <div className="flex size-[150px] items-center justify-center rounded-[75px] bg-mint-soft transition-transform duration-1000 ease-in-out" style={{ transform: `scale(${scale})` }}>
          <div className="flex size-[104px] flex-col items-center justify-center gap-0.5 rounded-[52px] bg-surface shadow-[0_8px_20px_rgba(21,26,19,0.08)]" aria-live="polite">
            <p className="type-label-m text-mint-text">{done ? "Well done" : PHASES[phase]}</p>
            <p className="type-title-m text-t1">{done ? "✓" : count}</p>
          </div>
        </div>
        {!done && (
          <div className="flex w-full items-start justify-center gap-2">
            <button type="button" aria-label={paused ? "Resume" : "Pause"} onClick={() => setPaused((p) => !p)} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] bg-ink">
              <FigmaIcon name={paused ? "play-white-18" : "pause-white-18"} size={18} />
            </button>
            <SoftChip label="Skip — keep talking" onClick={() => onDone(true)} />
          </div>
        )}
      </div>
      {last && <StatusPill text={last} />}
    </div>
  );
}

export function StatusPill({ text }: { text: string }) {
  return (
    <div role="status" className="flex items-center gap-1.5 self-start rounded-full bg-lime-soft px-3 py-1.5">
      <FigmaIcon name="check-limedeep-14" size={14} />
      <p className="type-caption text-lime-deep">{text}</p>
    </div>
  );
}

/** X5 · thinking trap card. */
export function TrapCard({ name, note, also }: { name: string; note: string; also?: string }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[24px] border border-white bg-lavender-soft p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-[12px] bg-surface">
          <FigmaIcon name="brain-lav-19" size={19} />
        </span>
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-s text-lavender-text">THINKING TRAP</p>
          <p className="type-title-m text-t1">{name}</p>
        </div>
      </div>
      <p className="type-body-m text-t2">{note}</p>
      {also && (
        <div className="flex items-center gap-2 rounded-[12px] bg-surface px-2.5 py-2">
          <FigmaIcon name="sparkle-lav-16" size={16} />
          <p className="flex-1 type-body-s text-t1">{also}</p>
        </div>
      )}
    </div>
  );
}

/** X6 · evidence for / against. */
export function EvidenceCard({ supports, against }: { supports: string[]; against: string[] }) {
  return (
    <div className="flex w-full items-stretch gap-2.5">
      <div className="flex flex-1 flex-col gap-2 rounded-[18px] bg-peach-soft p-3">
        <p className="type-label-s text-peach-text">SUPPORTS IT</p>
        {supports.map((s) => (
          <div key={s} className="flex items-start gap-1.5">
            <span className="pt-0.5">
              <FigmaIcon name="alert-peach-14" size={14} />
            </span>
            <p className="flex-1 type-body-s text-t1">{s}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2 rounded-[18px] bg-lime-soft p-3">
        <p className="type-label-s text-lime-deep">DOESN&apos;T FIT</p>
        {against.map((s) => (
          <div key={s} className="flex items-start gap-1.5">
            <span className="pt-0.5">
              <FigmaIcon name="check-limedeep-14" size={14} />
            </span>
            <p className="flex-1 type-body-s text-t1">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two stacked bars (peach = before, lime = after) + "80 → 40" — used in X6, X9. */
export function BeforeAfter({ label, before, after, labelWidth = 70, bar = 8 }: { label: string; before: number; after: number; labelWidth?: number; bar?: 8 | 10 }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <p className="shrink-0 type-body-s text-t2" style={{ width: labelWidth }}>
        {label}
      </p>
      <div className="flex flex-1 flex-col gap-1">
        <div className="rounded-[4px] bg-peach-soft" style={{ width: `${before}%`, height: bar, borderRadius: bar / 2 }} />
        <div style={{ width: `${after}%`, height: bar, borderRadius: bar / 2, backgroundImage: "linear-gradient(173.29deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }} />
      </div>
      <p className="shrink-0 type-label-m text-t1 tabular-nums">
        {before} → {after}
      </p>
    </div>
  );
}

/** "I'm useless" from "Everyone at work thinks I'm useless." */
export function coreOf(thought: string) {
  const m = thought.match(/\bi'?m [^.,!?]+/i)?.[0];
  return m ? m[0].toUpperCase() + m.slice(1) : thought.length > 28 ? `${thought.slice(0, 26)}…` : thought;
}

/** X6 · a fairer thought + belief re-rate (drag the lime bar). */
export function FairerCard({ text, thought, before, after, locked, onRate }: { text: string; thought: string; before: number; after?: number; locked?: boolean; onRate: (n: number) => void }) {
  const now = after ?? before;
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[24px] border border-white bg-white/85 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      <p className="type-label-s text-lime-deep">A FAIRER THOUGHT</p>
      <p className="type-title-l text-forest">{text}</p>
      <div className="relative flex flex-col gap-1.5 rounded-[14px] bg-subtle p-3">
        <p className="type-body-s text-t2">How much do you believe &quot;{coreOf(thought)}&quot; now?</p>
        <BeforeAfter label="Belief" before={before} after={now} />
        {!locked && <input type="range" min={0} max={100} step={5} value={now} aria-label={`How much do you believe "${coreOf(thought)}" now?`} onChange={(e) => onRate(Number(e.target.value))} className="absolute inset-x-[92px] bottom-2 h-6 cursor-pointer opacity-0" />}
      </div>
    </div>
  );
}

/** X12 · careful question when risk words appear. */
export function SafetyCard({ quote, picked, onPick }: { quote: string; picked?: string; onPick: (v: string) => void }) {
  const opts: { label: string; variant: "glass" | "forest" }[] = [
    { label: "No — I'm just exhausted", variant: "glass" },
    { label: "Sometimes, yes", variant: "forest" },
    { label: "I'd rather not say", variant: "glass" },
  ];
  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[26px] border border-peach-soft bg-peach-subtle p-[18px] shadow-[0_16px_32px_-10px_rgba(21,26,19,0.1)]">
      <div className="flex items-center gap-2">
        <FigmaIcon name="heart-peach-16" size={16} />
        <p className="type-label-s text-peach-text">A CAREFUL QUESTION</p>
      </div>
      <p className="type-title-l text-forest">When you say &quot;{quote}&quot; — are you having thoughts of not wanting to be here?</p>
      {opts.map((o) => (
        <Pill key={o.label} label={o.label} variant={o.variant} icon={null} disabled={!!picked && picked !== o.label} className="w-full" onClick={() => !picked && onPick(o.label)} />
      ))}
      <p className="type-body-s text-t2">Whatever you answer, I&apos;m staying right here with you.</p>
    </div>
  );
}

export function PhoneRow() {
  return (
    <a href="tel:14416" className="flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/85 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      <span className="flex size-9 items-center justify-center rounded-[12px] bg-peach-soft">
        <FigmaIcon name="phone-peach-19" size={19} />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="type-label-m text-t1">Talk to a person now</span>
        <span className="type-caption text-t3">Tele-MANAS 14416 · free · 24×7 · Malayalam</span>
      </span>
      <FigmaIcon name="chevron-right" size={18} />
    </a>
  );
}

/** X14 · a worry parked until worry time. */
export function ParkedCard({ what, when }: { what: string; when: string }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-[20px] border border-white/18 bg-white/10 p-3.5 backdrop-blur-[12px]">
      <span className="flex size-9 items-center justify-center rounded-[12px] bg-white/12">
        <FigmaIcon name="lock-lime-19" size={19} />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="type-label-m text-white">Parked: {what}</p>
        <p className="type-caption text-lime">{when}</p>
      </div>
      <FigmaIcon name="check-lime-18" size={18} />
    </div>
  );
}

/** X14 · soft night options. */
export function NightChips({ picked, onPick }: { picked?: string; onPick: (v: string) => void }) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {["Sleep sounds", "Body scan · 5 min", "Keep talking"].map((o) => {
        const lime = o === "Body scan · 5 min";
        return (
          <button
            key={o}
            type="button"
            disabled={!!picked && picked !== o}
            onClick={() => onPick(o)}
            className={cn("cursor-pointer rounded-full px-4 py-[11px] type-label-m disabled:opacity-50", lime ? "text-forest" : "border border-white/20 bg-white/10 text-white")}
            style={lime ? { backgroundImage: "linear-gradient(163.95deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

const REPAIRS = [
  { label: "Just listen for a while", icon: "heart-peach-17", bg: "bg-peach-soft" },
  { label: "It's more about my family", icon: "users-lav-17", bg: "bg-lavender-soft" },
  { label: "Say things more simply", icon: "sparkle-sun-17", bg: "bg-sun-soft" },
  { label: "Try a different way", icon: "path-sky-17", bg: "bg-sky-soft" },
];

/** X8 · Evo got it wrong — what would help more? */
export function RepairRows({ picked, onPick }: { picked?: string; onPick: (v: string) => void }) {
  return (
    <div className="flex w-full flex-col gap-3">
      {REPAIRS.map((r) => (
        <button
          key={r.label}
          type="button"
          disabled={!!picked}
          onClick={() => onPick(r.label)}
          className={cn("flex w-full cursor-pointer items-center gap-3 rounded-[16px] border border-white bg-white/85 p-2.5 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px] disabled:cursor-default", picked && picked !== r.label && "opacity-50", picked === r.label && "border-lime bg-lime-soft")}
        >
          <span className={cn("flex size-8 items-center justify-center rounded-[11px]", r.bg)}>
            <FigmaIcon name={r.icon} size={17} />
          </span>
          <span className="flex-1 type-label-m text-t1">{r.label}</span>
          <FigmaIcon name="chevron-right-16" size={16} />
        </button>
      ))}
    </div>
  );
}

/** 3.2 · "Listening mode" pill. */
export function ListeningPill() {
  return (
    <div className="flex items-center gap-2 self-start rounded-full bg-lavender-soft px-3 py-2">
      <FigmaIcon name="heart-lav-14" size={14} />
      <p className="type-label-s text-lavender-text">Listening mode</p>
    </div>
  );
}

/** 3.2 · offer help without pushing it. */
export function HelpOffer({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center gap-2.5 rounded-[18px] border border-white bg-white/78 p-3 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      <span className="flex size-[30px] items-center justify-center rounded-[10px] bg-lime-soft">
        <FigmaIcon name="sparkle-limedeep-16" size={16} />
      </span>
      <span className="flex-1 type-body-s text-t2">Want help with this, or keep talking?</span>
    </button>
  );
}

/** Row used in X9/X10/X11: 36 tile + title/caption + trailing. */
export function TileRow({ icon, iconSize = 19, tile = 36, tileBg, title, note, trailing, className, href, onClick }: { icon: string; iconSize?: number; tile?: number; tileBg: string; title: string; note: string; trailing?: ReactNode; className?: string; href?: string; onClick?: () => void }) {
  const body = (
    <>
      <span className={cn("flex shrink-0 items-center justify-center", tileBg)} style={{ width: tile, height: tile, borderRadius: tile === 36 ? 12 : 11 }}>
        <FigmaIcon name={icon} size={iconSize} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="type-label-m text-t1">{title}</span>
        <span className="type-caption text-t3">{note}</span>
      </span>
      {trailing}
    </>
  );
  const cls = cn("flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/85 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", className);
  if (href) return <Link href={href} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cn(cls, "cursor-pointer")}>{body}</button>;
  return <div className={cls}>{body}</div>;
}

/** 22 px radio / check used in X2 and X10. */
export function RadioDot({ on }: { on: boolean }) {
  return on ? (
    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-[11px] bg-lime-deep">
      <FigmaIcon name="check-white-14" size={14} />
    </span>
  ) : (
    <span className="size-[22px] shrink-0 rounded-[11px] border border-line-strong bg-surface" />
  );
}

/** 44×26 switch used on the chat result screens (X9, X11). */
export function SmallToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn("flex h-[26px] w-11 shrink-0 cursor-pointer items-center rounded-[13px] p-[3px] transition-colors duration-200", on ? "justify-end bg-lime-deep" : "bg-line-strong")}>
      <span className="size-5 rounded-[10px] bg-surface" />
    </button>
  );
}

/** 8.2 · Soft check-in: something sounds this heavy, even without crisis words. */
export function SoftCheckCard({ picked, onPick }: { picked?: string; onPick: (v: string) => void }) {
  const opts: { label: string; variant: "forest" | "glass" }[] = [
    { label: "Show me support now", variant: "forest" },
    { label: "Message someone I trust", variant: "glass" },
    { label: "I'm okay, just exhausted", variant: "glass" },
  ];
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3 rounded-[28px] border border-peach-soft bg-peach-subtle p-[18px] shadow-[0_18px_34px_-12px_rgba(21,26,19,0.12)]">
        <div className="flex items-center gap-2.5">
          <Orb size={32} />
          <p className="type-label-m text-peach-text">Evo</p>
        </div>
        <p className="type-title-l text-forest">That sounds really heavy. I want to make sure you&apos;re okay right now.</p>
        {opts.map((o) => (
          <Pill key={o.label} label={o.label} variant={o.variant} icon={null} disabled={!!picked && picked !== o.label} className="w-full" onClick={() => onPick(o.label)} />
        ))}
      </div>
      <p className="type-caption text-t3">Evo checks in whenever something sounds this heavy — even without &quot;crisis words&quot;. Saying you&apos;re okay is always fine.</p>
    </div>
  );
}

/** Peach "Support" pill used in chat headers during a safety moment (8.2). */
export function SupportPill() {
  return (
    <Link href="/crisis" className="flex items-center gap-1.5 rounded-full bg-peach-soft px-3 py-2">
      <FigmaIcon name="lifebuoy-peach-14" size={14} />
      <span className="type-label-s text-peach-text">Support</span>
    </Link>
  );
}
