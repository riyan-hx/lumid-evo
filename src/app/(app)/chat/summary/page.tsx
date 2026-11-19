"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BeforeAfter, coreOf, SmallToggle, TileRow } from "@/components/chat/parts";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { dayLabel, MODE_LABEL, useChats } from "@/lib/chat";

/** X9 · What we did (chat result) — Figma node 142:3538 */
function Summary() {
  const router = useRouter();
  const toast = useToast();
  const id = useSearchParams().get("id");
  const { chats, update, ready } = useChats();
  const chat = chats.find((c) => c.id === id);

  if (!chat) {
    return (
      <FigmaScreen gap={12}>
        <FlowHeader solid icon="close" label="Close" title="Chat summary" sub={ready ? "This chat isn't on this phone" : ""} onClick={() => router.push("/chat")} />
      </FigmaScreen>
    );
  }

  const mins = Math.max(1, Math.round((new Date(chat.updatedAt).getTime() - new Date(chat.startedAt).getTime()) / 6e4));
  const rows = [...(chat.belief ? [{ name: coreOf(chat.thought ?? "").replace(/^I'?m /i, ""), start: chat.belief[0], end: chat.belief[1], belief: true }] : []), ...chat.feelings.map((f) => ({ ...f, end: f.end ?? f.start, belief: false }))];
  const rate = (name: string, end: number) => update(chat.id, (c) => ({ ...c, feelings: c.feelings.map((f) => (f.name === name ? { ...f, end } : f)) }));

  function save() {
    update(chat!.id, (c) => ({ ...c, savedToJournal: true }));
    toast.show("Saved to your journal");
    router.push(`/chat/close?id=${chat!.id}`);
  }

  return (
    <FigmaScreen gap={12}>
      <FlowHeader solid icon="close" label="Close" title="Chat summary" sub={`${dayLabel(chat.startedAt)} · ${mins} min · ${MODE_LABEL[chat.mode].toLowerCase()}`} onClick={() => router.push("/chat")} />
      <div className="flex w-full items-center gap-3">
        <Orb size={52} />
        <div className="flex flex-1 flex-col gap-0.5">
          <h1 className="type-title-m text-forest">That was real work.</h1>
          <p className="max-w-[240px] type-body-s text-t2">Here&apos;s what you did — kept just for you.</p>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="flex w-full flex-col gap-2.5 rounded-[20px] border border-white bg-white/85 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          <p className="type-label-s text-t3">HOW YOU FELT · START → END</p>
          {rows.map((r) => (
            <div key={r.name} className="relative">
              <BeforeAfter label={r.name[0].toUpperCase() + r.name.slice(1)} before={r.start} after={r.end} />
              {!r.belief && <input type="range" min={0} max={100} step={5} value={r.end} aria-label={`How strong is ${r.name.toLowerCase()} now?`} onChange={(e) => rate(r.name, Number(e.target.value))} className="absolute inset-y-0 right-[70px] left-[80px] cursor-pointer opacity-0" />}
            </div>
          ))}
        </div>
      )}

      {chat.thought && chat.fairer && (
        <div className="flex w-full flex-col gap-2 rounded-[20px] bg-lavender-soft p-3.5">
          <div className="flex items-center gap-2">
            <FigmaIcon name="brain-lav-16" size={16} />
            <p className="type-label-s text-lavender-text">THOUGHT → FAIRER THOUGHT</p>
          </div>
          <p className="type-body-m text-t1">
            &quot;{chat.thought}&quot; → {chat.fairer}
          </p>
        </div>
      )}

      {chat.step ? (
        <Link href={`/chat/step?id=${chat.id}`} className="flex w-full items-center gap-3 rounded-[20px] bg-lime-soft p-3.5">
          <span className="flex size-9 items-center justify-center rounded-[12px] bg-surface">
            <FigmaIcon name="target-limedeep-19" size={19} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="type-label-m text-t1">Your next small step</span>
            <span className="type-caption text-t2">
              {chat.step.text} · {chat.step.when}
            </span>
          </span>
          <FigmaIcon name="bell-limedeep-18" size={18} />
        </Link>
      ) : (
        <Link href={`/chat/step?id=${chat.id}`} className="flex w-full items-center gap-3 rounded-[20px] bg-lime-soft p-3.5">
          <span className="flex size-9 items-center justify-center rounded-[12px] bg-surface">
            <FigmaIcon name="target-limedeep-19" size={19} />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="type-label-m text-t1">Pick one small next step</span>
            <span className="type-caption text-t2">Small enough for a hard day</span>
          </span>
          <FigmaIcon name="chevron-right" size={18} />
        </Link>
      )}

      <TileRow
        icon="calendar-sky-17"
        iconSize={17}
        tile={32}
        tileBg="bg-sky-soft"
        title="Share with your clinician"
        note="Summary only · not the full chat"
        trailing={<SmallToggle on={!!chat.shareSummary} label="Share with your clinician" onChange={(v) => update(chat.id, (c) => ({ ...c, shareSummary: v }))} />}
      />

      <Grow />
      <Pill label="Save to my journal" className="w-full" onClick={save} />
      <Link href={`/chat/live?id=${chat.id}`} className="text-center type-label-m text-t2">
        Keep talking
      </Link>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Summary />
    </Suspense>
  );
}
