"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CARD, OHeader, ORow } from "@/components/discover/parts";
import { FigmaIcon, FigmaToggle, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import type { CheckIn } from "@/lib/checkins";
import { cn } from "@/lib/cn";
import { storm, type StormPlan, uid } from "@/lib/discover";
import { trusted, type Trusted } from "@/lib/safety";
import { read } from "@/lib/store";
import { activities } from "@/lib/tool-store";

type Status = { showing: boolean; note: string };
const ICON = { sleep: ["moon2-lav-19", "bg-lavender-soft"], walks: ["leaf-mint-19", "bg-mint-soft"], custom: ["chat-sky-19", "bg-sky-soft"] } as const;

/** Signs read from the person's own check-ins and activities (last 7 days vs the 3 weeks before). */
function detect(now: number): Record<"sleep" | "walks", Status> {
  const day = 864e5;
  const mornings = read<CheckIn[]>("evo.checkins.v1", []).filter((c) => c.sleep && now - new Date(c.at).getTime() < 7 * day);
  const short = mornings.filter((c) => c.sleep!.hours < 6).length;
  const walks = activities.all().filter((a) => a.kind === "walk");
  const recent = walks.filter((a) => now - new Date(a.at).getTime() < 7 * day).length;
  const before = walks.filter((a) => {
    const age = now - new Date(a.at).getTime();
    return age >= 7 * day && age < 28 * day;
  }).length;
  return {
    sleep: { showing: short >= 3, note: mornings.length ? `${short} short ${short === 1 ? "night" : "nights"} this week` : "From your morning check-ins" },
    walks: { showing: before > 0 && recent === 0, note: before > 0 ? (recent ? `${recent} this week` : "None this week") : "From your activities" },
  };
}

/** O9 · Your early-warning signs — Figma node 147:3856. */
export default function StormSigns() {
  const router = useRouter();
  const [p, setP] = useState<StormPlan | null>(null);
  const [st, setSt] = useState<Record<"sleep" | "walks", Status> | null>(null);
  const [who, setWho] = useState<Trusted | null>(null);
  const [newSign, setNewSign] = useState("");
  const [newStep, setNewStep] = useState("");
  useEffect(() => {
    setP(storm.get()); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setSt(detect(Date.now()));
    setWho(trusted.get());
  }, []);
  if (!p || !st) return <FigmaScreen mood="calm">{null}</FigmaScreen>;

  const save = (next: StormPlan) => {
    storm.save(next);
    setP(next);
  };
  const showing = p.signs.filter((s) => s.kind !== "custom" && st[s.kind].showing).length;
  const name = who?.name ?? "someone you trust";

  return (
    <FigmaScreen gap={12} mood="calm">
      <OHeader icon="chevron-left" label="Back" title="Your storm signs" sub="Learned from your check-ins · you can edit" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">Before your hard weeks, these usually show up first.</h1>
      {p.signs.map((s) => (
        <ORow key={s.id} icon={ICON[s.kind][0]} tileBg={ICON[s.kind][1]} title={s.text} note={s.kind === "custom" ? "You added this one" : st[s.kind].note}>
          {s.kind !== "custom" && st[s.kind].showing && <span className="rounded-full bg-sun-soft px-2 py-[3px] type-caption text-sun-text">Showing now</span>}
        </ORow>
      ))}
      <form
        className={cn("flex w-full gap-2 p-3", CARD)}
        onSubmit={(e) => {
          e.preventDefault();
          if (newSign.trim()) save({ ...p, signs: [...p.signs, { id: uid(), text: newSign.trim(), kind: "custom" }] });
          setNewSign("");
        }}
      >
        <input aria-label="Add a sign you notice" value={newSign} onChange={(e) => setNewSign(e.target.value)} placeholder="Add a sign you notice in yourself" className="min-w-0 flex-1 bg-transparent type-body-s text-t1 outline-none placeholder:text-t3" />
        <button type="submit" className="cursor-pointer type-label-s text-lime-deep">
          Add
        </button>
      </form>
      <div className="flex w-full flex-col gap-2.5 rounded-[22px] bg-lime-soft p-4">
        <p className="type-label-s text-lime-deep">WHEN 2 SHOW UP, MY PLAN IS…</p>
        {p.plan.map((l) => (
          <div key={l} className="flex items-center gap-2">
            <FigmaIcon name="check2-limedeep-16" size={16} />
            <p className="flex-1 type-body-m text-t1">{l}</p>
          </div>
        ))}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newStep.trim()) save({ ...p, plan: [...p.plan, newStep.trim()] });
            setNewStep("");
          }}
        >
          <input aria-label="Add a step to your plan" value={newStep} onChange={(e) => setNewStep(e.target.value)} placeholder={p.plan.length ? "Add another step" : "e.g. Bed by 11 — phone outside the room"} className="min-w-0 flex-1 bg-transparent type-body-s text-t1 outline-none placeholder:text-t3" />
          <button type="submit" className="cursor-pointer type-label-s text-lime-deep">
            Add
          </button>
        </form>
      </div>
      <div className={cn("flex w-full items-center gap-3 p-3", CARD)}>
        <Tile size={32} radius={11} bg="bg-lavender-soft">
          <FigmaIcon name="users-lav-17" size={17} />
        </Tile>
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="type-label-m text-t1">Let {name} know when 2 appear</p>
          <p className="type-caption text-t3">{who ? `${who.name} gets "check on me", nothing more` : "Set up someone you trust first"}</p>
        </div>
        {who ? (
          <FigmaToggle on={p.tellTrusted} onChange={(v) => save({ ...p, tellTrusted: v })} label={`Let ${name} know`} />
        ) : (
          <a href="/safety/reach-out" className="type-label-s text-lime-deep">
            Set up
          </a>
        )}
      </div>
      {who && p.tellTrusted && showing >= 2 && (
        <a href={`sms:${who.phone}?body=${encodeURIComponent("Check on me?")}`} className="w-full rounded-full bg-forest py-4 text-center type-label-m text-white">
          Send {who.name} &quot;check on me&quot;
        </a>
      )}
      <Grow />
    </FigmaScreen>
  );
}
