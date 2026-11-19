"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, FigmaToggle, RowCard, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { useToast } from "@/components/states/toast";
import { Monogram } from "@/components/you/parts";
import { Pill } from "@/components/ui/pill";
import { lookupCode } from "@/lib/api/clinician";
import { circle, type Clinician, initials, type Sharing } from "@/lib/circle";

/** 9.1 · Connect your psychologist — Figma node 129:2515. Everything starts off. */
export default function Connect() {
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [match, setMatch] = useState<Clinician | null>(null);
  const [checked, setChecked] = useState(false);
  const [share, setShare] = useState<Sharing>({ mood: false, steps: false, chats: false });

  useEffect(() => {
    if (code.replace(/[^a-z0-9]/gi, "").length < 6) return;
    let live = true;
    lookupCode(code).then((c) => {
      if (!live) return;
      setMatch(c);
      setChecked(true);
      if (c) setCode(c.code);
    });
    return () => {
      live = false;
    };
  }, [code]);

  const set = (k: keyof Sharing) => (v: boolean) => setShare((s) => ({ ...s, [k]: v }));
  const who = match?.first.toUpperCase() ?? "THEY";

  return (
    <FigmaScreen gap={14} mood="calm">
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="chevron-left" label="Back" onClick={() => router.back()} />
      </div>
      <h1 className="type-flow-title text-forest">Connect your psychologist</h1>
      <p className="type-body-m text-t2">Evo becomes your between-sessions companion. Nothing is shared until you choose.</p>
      <label className="flex w-full items-center gap-2.5 rounded-[30px] border border-lime bg-surface p-1.5 shadow-[0_12px_28px_rgba(21,26,19,0.1)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[22px] bg-lime-soft">
          <FigmaIcon name="key-limedeep-20" size={20} />
        </span>
        <span className="sr-only">Code from your psychologist</span>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setMatch(null);
            setChecked(false);
          }}
          placeholder="Code from your psychologist"
          autoCapitalize="characters"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent type-title-l text-t1 outline-none placeholder:type-body-m placeholder:text-t3"
        />
      </label>
      {match ? (
        <div className="flex w-full items-center gap-3 rounded-[22px] p-3.5" style={{ backgroundImage: "var(--gradient-forest)" }}>
          <Monogram text={initials(match.name)} size={44} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="type-label-m text-white">{match.name}</p>
            <p className="truncate type-caption text-lime-soft">
              {match.title} · {match.city}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-lime-soft px-2.5 py-[5px] type-caption text-lime-deep">Code matched</span>
        </div>
      ) : (
        checked && (
          <p role="alert" className="type-body-s text-t-danger">
            That code didn&apos;t match. Check it with your psychologist.
          </p>
        )
      )}
      <SectionLabel>WHAT {who} CAN SEE — ALL OFF UNTIL YOU CHOOSE</SectionLabel>
      <RowCard icon="cloud-sky-19" tileBg="bg-sky-soft" title="Mood trends" note="Weekly, not daily detail">
        <FigmaToggle on={share.mood} onChange={set("mood")} label="Share mood trends" />
      </RowCard>
      <RowCard icon="path-limedeep-19" tileBg="bg-lime-soft" title="Steps and tools" note="What you tried and how it went">
        <FigmaToggle on={share.steps} onChange={set("steps")} label="Share steps and tools" />
      </RowCard>
      <RowCard icon="lock-lav-19" tileBg="bg-lavender-soft" title="Private chats" note="Never, unless you turn this on for one session">
        <FigmaToggle on={share.chats} onChange={set("chats")} label="Share private chats" />
      </RowCard>
      <Grow />
      <Pill
        label="Connect"
        className="w-full"
        disabled={!match}
        onClick={() => {
          if (!match) return;
          circle.connect(match, share);
          toast.show(`Connected to ${match.name}`);
          router.push("/settings");
        }}
      />
    </FigmaScreen>
  );
}
