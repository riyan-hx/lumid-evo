"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { Pill } from "@/components/ui/pill";
import { DEFAULT_MESSAGE, trusted, type Trusted } from "@/lib/safety";

const FIELD = "w-full rounded-[14px] border border-line bg-white px-3.5 py-3 type-body-m text-t1 outline-none focus:border-lime-deep";
const BLANK: Trusted = { name: "", relation: "", phone: "", message: DEFAULT_MESSAGE };

/** 8.6 · Reach out — Figma node 127:2529. Only the person's own message is sent, from their phone. */
export default function ReachOut() {
  const router = useRouter();
  const [t, setT] = useState<Trusted | null>(null);
  const [draft, setDraft] = useState<Trusted>(BLANK);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const saved = trusted.get();
    setT(saved); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setEditing(!saved);
    if (saved) setDraft(saved);
  }, []);

  const save = () => {
    const next = { ...draft, name: draft.name.trim(), phone: draft.phone.trim(), message: draft.message.trim() || DEFAULT_MESSAGE };
    trusted.save(next);
    setT(next);
    setEditing(false);
  };
  const set = (k: keyof Trusted) => (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  if (editing)
    return (
      <FigmaScreen gap={14} mood="warm">
        <div className="flex w-full items-center gap-2.5">
          <RoundButton icon="chevron-left" label="Back" onClick={() => (t ? setEditing(false) : router.back())} />
          <p className="type-label-m text-t1">Someone you trust</p>
        </div>
        <h1 className="type-flow-title text-forest">Who should get your message?</h1>
        <p className="type-body-m text-t2">Write it now, for a night when words are hard.</p>
        <input aria-label="Name" placeholder="Name" value={draft.name} onChange={set("name")} className={FIELD} />
        <input aria-label="Who they are to you" placeholder="Who they are to you (e.g. Sister)" value={draft.relation} onChange={set("relation")} className={FIELD} />
        <input aria-label="Phone number" placeholder="Phone number" type="tel" inputMode="tel" value={draft.phone} onChange={set("phone")} className={FIELD} />
        <textarea aria-label="Your message" rows={3} value={draft.message} onChange={set("message")} className={`${FIELD} resize-none`} />
        <Grow />
        <Pill label="Save" icon={null} className="w-full" disabled={!draft.name.trim() || !draft.phone.trim()} onClick={save} />
      </FigmaScreen>
    );

  if (!t) return null;
  const sms = `sms:${t.phone}?body=${encodeURIComponent(t.message)}`;
  return (
    <FigmaScreen gap={14} mood="warm">
      <div className="flex w-full items-center gap-2.5">
        <RoundButton icon="chevron-left" label="Back" onClick={() => router.back()} />
        <p className="type-label-m text-t1">Someone you trust</p>
      </div>
      <h1 className="type-flow-title text-forest">Send your ready message?</h1>
      <p className="type-body-m text-t2">You wrote this on a good day, for a night like this.</p>
      <div className="flex w-full items-center gap-3 rounded-[22px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full type-title-l text-forest" style={{ backgroundImage: "var(--gradient-lime)" }}>
          {t.name[0]?.toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="type-title-m text-t1">{t.name}</p>
          <p className="type-caption text-t3">{t.relation ? `${t.relation} · SMS` : "SMS"}</p>
        </div>
        <button type="button" aria-label="Edit contact" onClick={() => setEditing(true)} className="cursor-pointer">
          <FigmaIcon name="pencil-t3-18" size={18} />
        </button>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[24px] p-5" style={{ backgroundImage: "var(--gradient-forest)" }}>
        <p className="type-label-s text-lime">YOUR MESSAGE</p>
        <p className="type-title-l text-white">&quot;{t.message}&quot;</p>
      </div>
      <div className="flex w-full items-center gap-2.5 rounded-[18px] bg-surface p-3">
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] bg-lime-soft">
          <FigmaIcon name="shield-limedeep" size={16} />
        </span>
        <p className="type-caption text-t2">Only this text is sent. Nothing from Evo is shared.</p>
      </div>
      <Grow />
      <Pill label={`Send to ${t.name}`} className="w-full" onClick={() => window.location.assign(sms)} />
      <Pill label={`Call ${t.name} instead`} variant="glass" icon={null} className="w-full" onClick={() => window.location.assign(`tel:${t.phone}`)} />
    </FigmaScreen>
  );
}
