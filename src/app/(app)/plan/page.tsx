"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Monogram, ROW, TabHeader } from "@/components/you/parts";
import { circle, type Homework, homework, initials, type Link } from "@/lib/circle";
import { cn } from "@/lib/cn";
import { read, write } from "@/lib/store";

const LOG = "evo.homeworklog.v1";

/** 9.3 · From your psychologist — Figma node 129:2684. The psychologist sees done / not done, never what was logged. */
export default function ThisWeek() {
  const router = useRouter();
  const toast = useToast();
  const [link, setLink] = useState<Link | null>(null);
  const [list, setList] = useState<Homework[]>([]);
  useEffect(() => {
    const l = circle.get();
    if (!l) return router.replace("/psychologist/connect");
    setLink(l); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setList(homework.all());
  }, [router]);
  if (!link) return <FigmaScreen className="pb-[110px]">{null}</FigmaScreen>;

  const card = list.find((h) => h.prompt);
  return (
    <FigmaScreen gap={12} className="pb-[110px]">
      <TabHeader title="This week" sub="Your plan" />
      {card?.prompt && (
        <div className="flex w-full flex-col gap-2.5 rounded-[26px] p-4 shadow-[0_16px_30px_-10px_rgba(21,26,19,0.25)]" style={{ backgroundImage: "linear-gradient(143.85deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
          <div className="flex items-center gap-2">
            <Monogram text={initials(link.clinician.name)} size={28} />
            <p className="flex-1 type-label-s text-lime">From {link.clinician.short}</p>
          </div>
          <p className="type-title-l text-white">{card.prompt.text}</p>
          <div className="flex flex-wrap gap-2">
            {card.prompt.chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  write(LOG, [{ text: c, at: new Date().toISOString() }, ...read<{ text: string; at: string }[]>(LOG, [])]);
                  toast.show("Logged. Only you can see what you logged.");
                }}
                className="cursor-pointer rounded-full bg-white/12 px-2.5 py-[7px] type-caption text-white"
              >
                &quot;{c}&quot;
              </button>
            ))}
          </div>
          <p className="type-caption text-lime-soft">{link.clinician.first} sees only whether it&apos;s done — not what you logged.</p>
        </div>
      )}
      {list.map((h) => (
        <button key={h.id} type="button" aria-pressed={!!h.done} onClick={() => setList(homework.tick(h.id))} className={cn(ROW, "cursor-pointer text-left")}>
          {h.done ? (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[14px]" style={{ backgroundImage: "var(--gradient-lime)" }}>
              <FigmaIcon name="check-forest-16" size={16} />
            </span>
          ) : (
            <span className="size-7 shrink-0 rounded-[14px] border-[1.5px] border-line-strong" />
          )}
          <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5", h.done ? "text-t3" : "")}>
            <span className={cn("type-label-m", h.done ? "text-t3" : "text-t1")}>{h.text}</span>
            <span className="type-caption text-t3">{h.target ? `${h.count ?? 0} of ${h.target} done` : h.note}</span>
          </span>
        </button>
      ))}
      {!list.length && <p className="type-body-m text-t2">Nothing from {link.clinician.short} yet. When something is set for you, it shows up here.</p>}
    </FigmaScreen>
  );
}
