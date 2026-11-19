"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { NoteStrip, ROW } from "@/components/you/parts";
import { Pill } from "@/components/ui/pill";
import { type Memory, memory, suggestFromData } from "@/lib/memory";
import { useProfile } from "@/lib/profile";
import { loadRecords } from "@/lib/thoughts";
import { activities } from "@/lib/tool-store";

type Pending = Omit<Memory, "id"> | null;

/** 9.5 · What Evo remembers — Figma node 129:2902. Only what the person approves; edit or remove any line. */
export default function Memories() {
  const router = useRouter();
  const toast = useToast();
  const { profile } = useProfile();
  const [saved, setSaved] = useState<Memory[]>([]);
  const [next, setNext] = useState<Pending>(null);
  const [edit, setEdit] = useState<{ id: string; text: string } | null>(null);

  const refresh = () => {
    setSaved(memory.saved());
    setNext(memory.next());
  };
  const decide = (keep: boolean) => {
    memory.decide(keep);
    refresh();
  };
  useEffect(() => {
    const tr = loadRecords().find((r) => r.balanced);
    suggestFromData({
      balanced: tr ? { text: tr.balanced, at: tr.at } : undefined,
      lifts: activities.all().filter((a) => a.actual !== undefined && a.actual > a.guess),
      language: profile.chatLanguage,
    });
    refresh(); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, [profile.chatLanguage]);

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title="What Evo remembers" sub="Only what you approve" onClick={() => router.back()} />
      {next && (
        <div className="flex w-full flex-col gap-2.5 rounded-[24px] border border-lavender-text bg-lavender-soft p-4">
          <p className="type-label-s text-lavender-text">NEW · SAVE THIS?</p>
          <p className="type-title-l text-forest">{next.text}</p>
          <p className="type-caption text-t3">{next.source}</p>
          <div className="flex w-full gap-2">
            <Pill label="Save" icon={null} className="flex-1" onClick={() => decide(true)} />
            <Pill label="Not this" variant="glass" icon={null} className="flex-1" onClick={() => decide(false)} />
          </div>
        </div>
      )}
      {saved.map((m) =>
        edit?.id === m.id ? (
          <form
            key={m.id}
            className={ROW}
            onSubmit={(e) => {
              e.preventDefault();
              if (edit.text.trim()) memory.edit(m.id, edit.text.trim());
              setEdit(null);
              refresh();
            }}
          >
            <input aria-label="Edit memory" autoFocus value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} className="min-w-0 flex-1 bg-transparent type-label-m text-t1 outline-none" />
            <button type="submit" className="cursor-pointer type-label-s text-lime-deep">
              Save
            </button>
          </form>
        ) : (
          <div key={m.id} className={`${ROW} gap-2.5`}>
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <p className="type-label-m text-t1">{m.text}</p>
              <p className="type-caption text-t3">{m.source}</p>
            </div>
            <button type="button" aria-label="Edit" onClick={() => setEdit({ id: m.id, text: m.text })} className="cursor-pointer">
              <FigmaIcon name="pencil-t3-18" size={18} />
            </button>
            <button
              type="button"
              aria-label="Forget this"
              onClick={() => {
                memory.remove(m.id);
                refresh();
                toast.show("Forgotten.");
              }}
              className="cursor-pointer"
            >
              <FigmaIcon name="trash-danger-18" size={18} />
            </button>
          </div>
        ),
      )}
      {!saved.length && !next && <p className="type-body-m text-t2">Nothing yet. When Evo learns something useful, it asks you first.</p>}
      <Grow />
      <NoteStrip icon="sparkle-limedeep-16" tileBg="bg-lime-soft">
        Edits apply from your very next chat.
      </NoteStrip>
    </FigmaScreen>
  );
}
