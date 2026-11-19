"use client";

import Link from "next/link";
import { useState } from "react";
import { BackRow, Body, FigmaIcon, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";

/** 1.5 · Guardian consent — Figma node 112:1568 */
export default function Guardian() {
  const { profile, update } = useProfile();
  const [digits, setDigits] = useState(profile.guardianPhone);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  return (
    <FigmaScreen gap={16}>
      <BackRow href="/age" />
      <Title>A quick okay from a parent</Title>
      <Body>Because you&apos;re under 18, a parent or guardian agrees first. It takes them a minute.</Body>
      <label className={`flex w-full items-center gap-2.5 rounded-[30px] border bg-surface p-1.5 ${error ? "border-t-danger" : "border-line-strong"}`}>
        <span className="rounded-[24px] bg-lime-soft p-3.5 type-label-m text-forest">+91</span>
        <span className="sr-only">Guardian&apos;s number</span>
        <input
          inputMode="numeric"
          value={digits}
          placeholder="Guardian's number"
          onChange={(e) => {
            setError(false);
            setDigits(e.target.value.replace(/\D/g, "").slice(0, 10));
          }}
          className="w-full bg-transparent type-body-l text-t1 outline-none placeholder:text-t3"
        />
      </label>
      <div className="flex w-full gap-2.5">
        {[
          { icon: "check-limedeep-17", bg: "bg-lime-soft", title: "They see", note: "That you use Evo, and what they agreed to." },
          { icon: "eyeoff-lav", bg: "bg-lavender-soft", title: "They never see", note: "Your chats, feelings, check-ins or memories." },
        ].map((c) => (
          <div key={c.title} className="flex flex-1 flex-col items-start gap-2 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <Tile size={32} radius={11} bg={c.bg}>
              <FigmaIcon name={c.icon} size={17} />
            </Tile>
            <p className="type-label-m text-t1">{c.title}</p>
            <p className="w-[130px] text-[11px] leading-[14px] tracking-[0.011px] text-t2">{c.note}</p>
          </div>
        ))}
      </div>
      {sent && (
        <p role="status" className="type-body-s text-lime-deep">
          Code sent. You can keep setting up while they say okay.
        </p>
      )}
      <Grow />
      <Pill
        label={sent ? "Continue setting up" : "Send them a code"}
        className="w-full"
        href={sent ? "/onboarding/weighing" : undefined}
        onClick={() => {
          if (sent) return;
          if (digits.length !== 10) return setError(true);
          update({ guardianPhone: digits });
          setSent(true);
        }}
      />
      <Link href="/crisis" className="flex w-full items-center gap-2.5 rounded-[16px] bg-peach-soft p-3">
        <FigmaIcon name="lifebuoy-peach" size={20} />
        <span className="flex-1 type-label-m text-peach-text">Need help right now? Crisis support is open.</span>
      </Link>
    </FigmaScreen>
  );
}
