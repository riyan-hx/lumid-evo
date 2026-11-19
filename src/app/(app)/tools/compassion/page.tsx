"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useChats } from "@/lib/chat";
import { cn } from "@/lib/cn";
import { kindPauses } from "@/lib/tool-store";

/** 5.5 · Self-compassion break — Figma node 121:2023 */
export default function KindPause() {
  const router = useRouter();
  const toast = useToast();
  const { chats } = useChats();
  const [at, setAt] = useState(1);
  const family = /(amma|mum|mom|dad|family|achan|appa|sister|brother)/i.test(chats[0]?.topic ?? "");
  const lines = [
    { head: "This is a moment of suffering.", say: '"This hurts. It makes sense that it hurts."' },
    { head: "You're not alone in this.", say: family ? '"Lots of people feel this with their families."' : '"Lots of people feel this way. It\'s part of being human."' },
    { head: "May I be kind to myself.", say: '"What would I say to a friend right now?"' },
  ];

  return (
    <FigmaScreen gap={14} mood="warm">
      <FlowHeader icon="close" label="Close" title="A kind pause" sub="2 minutes · hand on heart if you like" onClick={() => router.push("/tools")} />
      <div className="flex w-full justify-center">
        <Orb size={84} state="breathing" />
      </div>
      <ol className="flex w-full flex-col gap-3.5" aria-live="polite">
        {lines.map((l, i) => {
          const on = i < at;
          return (
            <li key={l.head} className={cn("flex w-full flex-col gap-1.5 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px] transition-opacity duration-300")}>
              <div className="flex items-center gap-2.5">
                <span className={cn("flex size-[26px] items-center justify-center rounded-[13px] type-label-s", on ? "text-forest" : "bg-line-strong text-t3")} style={on ? { backgroundImage: "linear-gradient(135deg, rgb(163,226,125) 0%, rgb(98,191,59) 71.429%)" } : undefined}>
                  {i + 1}
                </span>
                <p className="flex-1 type-label-m text-t1">{l.head}</p>
              </div>
              <p className="type-body-s text-t2">{l.say}</p>
            </li>
          );
        })}
      </ol>
      <Grow />
      <div className="flex w-full items-center gap-2.5 rounded-[18px] bg-peach-soft p-3">
        <FigmaIcon name="hand-peach-20" size={20} />
        <p className="flex-1 type-body-s text-peach-text">Say it out loud, or just read it slowly.</p>
      </div>
      <Pill
        label={at < 3 ? "Next sentence" : "I'm done"}
        className="w-full"
        onClick={() => {
          if (at < 3) return setAt(at + 1);
          kindPauses.add();
          toast.show("That was kind. Well done.");
          router.push("/tools");
        }}
      />
    </FigmaScreen>
  );
}
