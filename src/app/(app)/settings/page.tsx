"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FigmaToggle, RowCard, SectionLabel } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { ago, LinkRow } from "@/components/you/parts";
import { Orb } from "@/components/ui/orb";
import { circle, type Link as ClinicianLink } from "@/lib/circle";
import { memory } from "@/lib/memory";
import { sub } from "@/lib/plan";
import { useProfile } from "@/lib/profile";
import { plan } from "@/lib/safety";

type Data = { link: ClinicianLink | null; planAt?: string; memories: number; plus: boolean; now: number };

/** 9.4 · You — Figma node 129:2772. "More" rows below are entry points the frame doesn't show. */
export default function You() {
  const { profile, update } = useProfile();
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    setD({ link: circle.get(), planAt: plan.get().updatedAt, memories: memory.saved().length, plus: sub.isPlus(), now: Date.now() }); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);
  const langs = profile.locales.length ? profile.locales.join(" + ") : "English";
  const link = d?.link;

  return (
    <FigmaScreen gap={10} className="pb-[110px]">
      <div className="flex w-full flex-col gap-px">
        <h1 className="type-label-m text-t1">You</h1>
        <p className="type-caption text-t3">Privacy, people and plan</p>
      </div>
      <Link
        href="/plus"
        className="flex w-full items-center gap-3 rounded-[24px] border border-white p-3.5"
        style={{ backgroundImage: "linear-gradient(167.26deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
      >
        <Orb size={48} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="type-title-m text-forest">{profile.name || "You"}</span>
          <span className="type-caption text-t2">
            {d?.plus ? "Evo Plus" : "Evo Free"} · {langs}
          </span>
        </span>
      </Link>

      <SectionLabel>PRIVACY</SectionLabel>
      <RowCard icon="eyeoff-lav-19" tileBg="bg-lavender-soft" title="Discreet mode" note='Shows as "Planner"'>
        <FigmaToggle on={profile.discreet} onChange={(v) => update({ discreet: v })} label="Discreet mode" />
      </RowCard>
      <RowCard icon="fingerprint-lav" tileBg="bg-lavender-soft" title="App lock" note="Face or PIN">
        <FigmaToggle on={profile.appLock} onChange={(v) => update({ appLock: v })} label="App lock" />
      </RowCard>

      <SectionLabel>PEOPLE &amp; SAFETY</SectionLabel>
      {link ? (
        <LinkRow href="/psychologist/brief" icon="stethoscope-mint" tileBg="bg-mint-soft" title={link.clinician.name} note={`Connected · sharing ${circle.sharedCount(link.sharing)} ${circle.sharedCount(link.sharing) === 1 ? "thing" : "things"}`} />
      ) : (
        <LinkRow href="/psychologist/connect" icon="stethoscope-mint" tileBg="bg-mint-soft" title="Connect your psychologist" note="Evo between your sessions" />
      )}
      <LinkRow href="/safety" icon="lifebuoy-peach-19" tileBg="bg-peach-soft" title="My safety plan" note={d?.planAt ? `Updated ${ago(d.planAt, d.now)}` : "Make one on a calmer day"} />

      <SectionLabel>YOUR DATA</SectionLabel>
      <LinkRow href="/memories" icon="brain-sky-19" tileBg="bg-sky-soft" title="What Evo remembers" note={`${d?.memories ?? 0} ${d?.memories === 1 ? "memory" : "memories"}`} />

      <SectionLabel>MORE</SectionLabel>
      <LinkRow href="/reminders" icon="moon-lav-19" tileBg="bg-lavender-soft" title="Reminders" note="Tied to moments, never nagging" />
      <LinkRow href="/wins" icon="quote-lav-18" tileBg="bg-lime-soft" title="Your evidence" note="Hard things you faced" />
      <LinkRow href="/plus" icon="crown-limedeep-23" tileBg="bg-lime-soft" title="Evo Plus" note={d?.plus ? "Active" : "Go deeper — help stays free"} />
      <LinkRow href="/delete" icon="trash-danger-19" tileBg="bg-danger-subtle" title="Delete my account" note="Exactly what happens, no tricks" />
    </FigmaScreen>
  );
}
