"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Composer } from "@/components/chat/parts";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { type ChatMode, dayLabel, useChats } from "@/lib/chat";
import { useCheckIns } from "@/lib/checkins";
import { STYLE_HREF, useProfile } from "@/lib/profile";

const WAYS: { mode: ChatMode; icon: string; bg: string; title: string; note: string }[] = [
  { mode: "talk", icon: "chat-lav-19", bg: "bg-lavender-soft", title: "Talk it through", note: "Questions, gently" },
  { mode: "listen", icon: "heart-peach-19", bg: "bg-peach-soft", title: "Just listen", note: "No advice" },
  { mode: "untangle", icon: "brain-sky-19", bg: "bg-sky-soft", title: "Untangle a thought", note: "CBT, step by step" },
  { mode: "calm", icon: "wind-mint-19", bg: "bg-mint-soft", title: "Calm me first", note: "1-min reset" },
];

/** X1 · Chat home (main) — Figma node 141:3847 */
export default function ChatHome() {
  const router = useRouter();
  const { chats } = useChats();
  const { items } = useCheckIns();
  const { profile } = useProfile();
  const [now] = useState(() => Date.now());

  const latest = items[0];
  const recent = latest && now - new Date(latest.at).getTime() < 12 * 36e5 && latest.intensity >= 40 ? latest : null;
  const word = recent ? (recent.word || recent.feeling).toLowerCase() : "";
  const open = chats.find((c) => !c.endedAt && c.topic && c.parts.some((p) => p.t === "me"));
  const openNote = open && [dayLabel(open.updatedAt), open.belief && `belief ${open.belief[0]} → ${open.belief[1]}`, open.step && !open.step.done && "1 step left"].filter(Boolean).join(" · ");

  return (
    <FigmaScreen gap={12} className="pb-[108px]">
      <div className="flex w-full items-center gap-2.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <h1 className="type-title-m text-t1">Talk with Evo</h1>
          <div className="flex items-center gap-1">
            <FigmaIcon name="lock-12" size={12} />
            <p className="type-caption text-t3">Private · only on your phone</p>
          </div>
        </div>
        <Link href="/chats" aria-label="Past chats" className="flex size-11 items-center justify-center rounded-[22px] border border-white bg-surface backdrop-blur-[12px]">
          <FigmaIcon name="clock-20" size={20} />
        </Link>
      </div>

      <section aria-label="Evo noticed" className="flex w-full flex-col gap-3 rounded-[28px] p-[18px] shadow-[0_18px_36px_-10px_rgba(21,26,19,0.18)]" style={{ backgroundImage: "linear-gradient(149.4deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <div className="flex items-center gap-3">
          <Orb size={48} />
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="type-label-s text-lime">{recent ? "EVO NOTICED" : "EVO IS HERE"}</p>
            <p className="type-caption text-white">{recent ? `You checked in ${word} · ${recent.intensity}` : "No check-in yet today"}</p>
          </div>
        </div>
        <p className="type-title-l text-white">{recent ? `Want to talk about what's making today ${word}?` : "What would help most right now?"}</p>
        <div className="flex gap-2">
          <Link href={recent ? "/chat/live?mode=talk&from=checkin" : "/chat/live?mode=talk"} className="rounded-full px-4 py-2.5 type-label-m text-forest" style={{ backgroundImage: "linear-gradient(160.78deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" }}>
            {recent ? "Yes, let's talk" : "Just talk"}
          </Link>
          <Link href={recent ? "/chat/live?mode=talk" : STYLE_HREF[profile.checkinStyle]} className="rounded-full border border-white/22 bg-white/12 px-4 py-2.5 type-label-m text-white">
            {recent ? "Something else" : "Check in first"}
          </Link>
        </div>
      </section>

      <p className="type-label-s text-t3">HOW DO YOU WANT TO TALK?</p>
      <div className="grid w-full grid-cols-2 gap-2.5">
        {WAYS.map((w) => (
          <Link key={w.mode} href={`/chat/live?mode=${w.mode}`} className="flex flex-col gap-2.5 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <span className={`flex size-9 items-center justify-center rounded-[12px] ${w.bg}`}>
              <FigmaIcon name={w.icon} size={19} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="type-label-m text-t1">{w.title}</span>
              <span className="type-caption text-t3">{w.note}</span>
            </span>
          </Link>
        ))}
      </div>

      {open && (
        <Link href={`/chat/live?id=${open.id}`} className="flex w-full items-center gap-3 rounded-[18px] border border-white bg-surface p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
          <span className="flex size-9 items-center justify-center rounded-[12px] bg-lime-soft">
            <FigmaIcon name="path-limedeep-19" size={19} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate type-label-m text-t1">Pick up: {open.topic}</span>
            <span className="type-caption text-t3">{openNote}</span>
          </span>
          <FigmaIcon name="chevron-right" size={18} />
        </Link>
      )}

      <Grow />
      <Composer sticky={false} placeholder="Or just start typing…" onPlus={() => router.push("/chat/style")} onSend={(t) => router.push(`/chat/live?q=${encodeURIComponent(t)}`)} />
    </FigmaScreen>
  );
}
