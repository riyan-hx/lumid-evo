"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { actionFor, clock, type Worry, WORRY_TIME, worries } from "@/lib/tool-store";


const PERSON = /\b(amma|achan|appa|mum|mom|dad|mother|father|sister|brother|her|his)\b/i;

function look(w: Worry) {
  if (!w.control) return { icon: "cloud-sky-18", bg: "bg-subtle", note: "Not sorted yet" };
  if (w.control === "cant") return { icon: "cloud-sky-18", bg: "bg-sky-soft", note: "Can't control · let go" };
  return PERSON.test(w.text) ? { icon: "heart-peach-18", bg: "bg-peach-soft", note: `Can act · ${w.action}` } : { icon: "target-limedeep-18", bg: "bg-lime-soft", note: `Can act · ${w.action}` };
}

/** 5.3 · Worry time — Figma node 120:2117 */
export default function WorryTime() {
  const router = useRouter();
  const toast = useToast();
  const { chats, ready } = useChats();
  const [list, setList] = useState<Worry[] | null>(null);
  const [text, setText] = useState("");
  const [sorting, setSorting] = useState(false);

  useEffect(() => {
    if (!ready || list) return;
    const saved = worries.all().filter((w) => !w.doneAt);
    // Worries parked in a late-night chat (X14) arrive here too.
    const fromChats = chats.flatMap((c) => c.parts.flatMap((p) => (p.t === "parked" ? [p.what] : []))).filter((t) => !saved.some((w) => w.text.toLowerCase() === t.toLowerCase()));
    setList([...saved, ...[...new Set(fromChats)].map((t) => worries.make(t[0].toUpperCase() + t.slice(1)))]); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
  }, [ready, list, chats]);

  if (!list) return <FigmaScreen mood="warm">{null}</FigmaScreen>;
  const add = () => {
    const t = text.trim();
    if (!t) return;
    setList([...list, worries.make(t)]);
    setText("");
  };
  const sort = (w: Worry, control: "can" | "cant") => setList(list.map((x) => (x.id === w.id ? { ...x, control, action: control === "can" ? actionFor(x.text) : undefined } : x)));

  return (
    <FigmaScreen gap={12} mood="warm">
      <FlowHeader icon="chevron-left" label="Back" title="Worry time" sub="Postpone, then sort" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">Park it until {clock(WORRY_TIME)}.</h1>
      <p className="type-body-m text-t2">Write a word or tap a worry. Evo hands them back at your worry time — 10 minutes, then sort.</p>
      {list.map((w) => {
        const l = look(w);
        return (
          <div key={w.id} className="flex w-full flex-col gap-2.5 rounded-[18px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <div className="flex w-full items-center gap-3">
              <span className={cn("flex size-[34px] shrink-0 items-center justify-center rounded-[11px]", l.bg)}>
                <FigmaIcon name={l.icon} size={18} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{w.text}</span>
                <span className="type-caption text-t3">{l.note}</span>
              </span>
            </div>
            {sorting && (
              <div className="flex gap-2 pl-[46px]">
                <SoftChip label="Can act" height={36} selected={w.control === "can"} onClick={() => sort(w, "can")} />
                <SoftChip label="Can't control" height={36} selected={w.control === "cant"} onClick={() => sort(w, "cant")} />
              </div>
            )}
          </div>
        );
      })}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex w-full items-center gap-2.5 rounded-[18px] border border-dashed border-lime bg-surface p-3"
      >
        <FigmaIcon name="plus-limedeep-14" size={14} />
        <input value={text} onChange={(e) => setText(e.target.value)} onBlur={add} placeholder="Write a word…" aria-label="Add a worry" className="min-w-0 flex-1 bg-transparent type-label-m text-t1 outline-none placeholder:text-lime-deep" />
      </form>
      <div className="flex w-full flex-col items-center gap-1.5 rounded-[22px] border-[1.5px] border-dashed border-peach-text bg-peach-soft p-4">
        <span className="flex size-10 items-center justify-center rounded-[13px] bg-surface">
          <FigmaIcon name="parking-peach-21" size={21} />
        </span>
        <p className="type-label-m text-peach-text" aria-live="polite">
          Parked until {clock(WORRY_TIME)} PM · {list.length} {list.length === 1 ? "worry" : "worries"}
        </p>
      </div>
      <Grow />
      <div className="flex w-full gap-2.5">
        <Pill
          label="Park them"
          className="flex-1"
          disabled={!list.length}
          onClick={() => {
            const until = new Date();
            const [h, m] = WORRY_TIME.split(":").map(Number);
            until.setHours(h, m, 0, 0);
            if (until.getTime() < Date.now()) until.setDate(until.getDate() + 1);
            worries.save([...list.map((w) => ({ ...w, parkedUntil: until.toISOString() })), ...worries.all().filter((w) => w.doneAt)]);
            toast.show(`Parked until ${clock(WORRY_TIME)} PM`);
            router.push("/tools");
          }}
        />
        <Pill label={sorting ? "Done sorting" : "Sort now"} variant="glass" icon={null} onClick={() => setSorting((s) => !s)} />
      </div>
    </FigmaScreen>
  );
}
