"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaToggle, FlowHeader, RowCard } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";
import { sendBrief } from "@/lib/api/clinician";
import { type BriefLine, briefLines } from "@/lib/brief";
import { circle, type Link, sessionLabel } from "@/lib/circle";

const ICON: Record<BriefLine["key"], [string, string]> = {
  mood: ["cloud-sky-19", "bg-sky-soft"],
  thought: ["brain-lav-19", "bg-lavender-soft"],
  steps: ["path-limedeep-19", "bg-lime-soft"],
};

/** 9.2 · Pre-session brief — Figma node 129:2597. The person picks every line; private chats stay out by default. */
export default function Brief() {
  const router = useRouter();
  const toast = useToast();
  const [link, setLink] = useState<Link | null>(null);
  const [lines, setLines] = useState<BriefLine[]>([]);
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [chats, setChats] = useState(false);
  const [topic, setTopic] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const l = circle.get();
    if (!l) return router.replace("/psychologist/connect");
    const b = briefLines();
    setLink(l); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setLines(b);
    setOn(Object.fromEntries(b.map((x) => [x.key, x.key === "mood" ? l.sharing.mood : l.sharing.steps])));
    setChats(l.sharing.chats);
  }, [router]);
  if (!link) return <FigmaScreen mood="calm">{null}</FigmaScreen>;

  const out = [...lines.filter((l) => on[l.key]).map((l) => `${l.title}: ${l.note}`), ...(topic.trim() ? [`Bring this up: ${topic.trim()}`] : [])];

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader icon="chevron-left" label="Back" title={`Brief for ${link.clinician.short}`} sub={link.nextSession ? `Session · ${sessionLabel(link.nextSession)}` : "Before your next session"} onClick={() => router.back()} />
      <p className="type-body-s text-t2">Choose what goes. You can edit every line.</p>
      {preview ? (
        <div className="flex w-full flex-col gap-2 rounded-[20px] bg-surface p-4">
          <p className="type-label-s text-t3">WHAT {link.clinician.first.toUpperCase()} WILL SEE</p>
          {out.length ? out.map((l) => <p key={l} className="type-body-s text-t1">{l}</p>) : <p className="type-body-s text-t3">Nothing selected yet.</p>}
          {chats && <p className="type-body-s text-t1">Private chats from this week</p>}
        </div>
      ) : (
        <>
          {lines.map((l) => (
            <RowCard key={l.key} icon={ICON[l.key][0]} tileBg={ICON[l.key][1]} title={l.title} note={l.note}>
              <FigmaToggle on={!!on[l.key]} onChange={(v) => setOn((o) => ({ ...o, [l.key]: v }))} label={`Include ${l.title.toLowerCase()}`} />
            </RowCard>
          ))}
          {!lines.length && <p className="type-body-s text-t3">Nothing from this week yet. Check-ins, thought records and steps show up here.</p>}
          <RowCard icon="lock-t2-19" tileBg="bg-muted" title="Private chats" note={chats ? "Included this time" : "Not included"}>
            <FigmaToggle on={chats} onChange={setChats} label="Include private chats" />
          </RowCard>
          <label
            className="flex w-full flex-col gap-1.5 rounded-[20px] border border-white p-3.5"
            style={{ backgroundImage: "linear-gradient(168.53deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
          >
            <span className="type-label-s text-lime-deep">BRING THIS UP</span>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Something you want to talk about" className="w-full bg-transparent type-label-m text-forest outline-none placeholder:text-t3" />
          </label>
        </>
      )}
      <Grow />
      <div className="flex w-full gap-2.5">
        <Pill
          label="Send brief"
          className="flex-1"
          disabled={sending || (!out.length && !chats)}
          onClick={async () => {
            setSending(true);
            await sendBrief(link.clinician.code, out);
            circle.update({ lastBriefAt: new Date().toISOString() });
            toast.show(`Sent to ${link.clinician.short}`);
            router.push("/settings");
          }}
        />
        <Pill label={preview ? "Edit" : "Preview"} variant="glass" icon={null} onClick={() => setPreview((p) => !p)} />
      </div>
    </FigmaScreen>
  );
}
