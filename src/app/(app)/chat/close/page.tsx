"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SmallToggle, TileRow } from "@/components/chat/parts";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";

const LEAVING = ["Heavier", "Same", "Lighter", "Calmer", "Clearer"];

/** "Tomorrow 10:00" → "Tomorrow, 10:30": Evo checks in half an hour after the step. */
function after(when: string) {
  const m = when.match(/^(.*?)\s*(\d{1,2}):(\d{2})$/);
  if (!m) return when;
  const t = new Date(2000, 0, 1, Number(m[2]), Number(m[3]) + 30);
  return `${m[1]}, ${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}`;
}

/** X11 · Gentle close — Figma node 144:3354 */
function Close() {
  const router = useRouter();
  const toast = useToast();
  const id = useSearchParams().get("id");
  const { chats, update } = useChats();
  const chat = chats.find((c) => c.id === id);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [checkBack, setCheckBack] = useState(true);
  const step = chat?.step;

  function close() {
    if (chat) update(chat.id, (c) => ({ ...c, leaving: leaving ?? undefined, checkBack, endedAt: new Date().toISOString() }));
    toast.show(checkBack ? "Chat closed · Evo will check in" : "Chat closed");
    router.push("/chat");
  }

  return (
    <FigmaScreen gap={14} mood="calm">
      <div className="flex h-[100px] w-full items-start">
        <button type="button" aria-label="Close" onClick={() => router.push("/chat")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/85 backdrop-blur-[12px]">
          <FigmaIcon name="close" size={20} />
        </button>
      </div>
      <Grow />
      <div className="flex w-full justify-center">
        <Orb size={96} />
      </div>
      <h1 className="text-center type-flow-title text-forest">How are you leaving this chat?</h1>
      <p className="text-center type-body-m text-t2">One tap. It helps Evo learn what works for you.</p>
      <div role="radiogroup" aria-label="How are you leaving this chat?" className="flex w-full gap-2">
        {LEAVING.map((l) => {
          const on = leaving === l;
          return (
            <button key={l} type="button" role="radio" aria-checked={on} onClick={() => setLeaving(l)} className={cn("flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-[18px] border py-3", on ? "border-lime bg-lime-soft" : "border-white bg-white/85")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma dot */}
              <img src={`/figma/chat/leave/${l.toLowerCase()}.svg`} alt="" width={20} height={20} />
              <span className="type-caption text-t1">{l}</span>
            </button>
          );
        })}
      </div>
      <TileRow
        icon="bell-limedeep-19"
        tileBg="bg-lime-soft"
        className="rounded-[20px] p-3.5"
        title={step ? "I'll check in after your step" : "I'll check in tomorrow"}
        note={step ? `${after(step.when)} · one gentle message` : "One gentle message"}
        trailing={<SmallToggle on={checkBack} onChange={setCheckBack} label="Let Evo check in" />}
      />
      <Grow />
      <Pill label="Close chat" className="w-full" onClick={close} />
      <Link href={chat ? `/chat/live?id=${chat.id}` : "/chat"} className="text-center type-label-m text-t2">
        Keep talking
      </Link>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Close />
    </Suspense>
  );
}
