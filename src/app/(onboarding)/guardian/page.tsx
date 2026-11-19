"use client";

import Link from "next/link";
import { useState } from "react";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";

/** 1.5 · Guardian consent */
export default function Guardian() {
  const { profile, update } = useProfile();
  const [phone, setPhone] = useState(profile.guardianPhone);
  const [sent, setSent] = useState(false);
  const digits = phone.replace(/\D/g, "").slice(0, 10);

  return (
    <div>
      <StepHeader step={1} back="/age" />
      <Heading title="A quick okay from a parent" sub="They approve once. They never see your chats or check-ins." />
      <div className="grid grid-cols-2 gap-2.5">
        <Card variant="tint" tone="lime">
          <p className="type-label-s text-lime-deep">THEY SEE</p>
          <p className="type-body-s">That you use Evo</p>
          <p className="type-body-s">Your plan (Free / Plus)</p>
        </Card>
        <Card variant="tint" tone="peach">
          <p className="type-label-s text-peach-text">THEY NEVER SEE</p>
          <p className="type-body-s">Chats, check-ins, journal</p>
          <p className="type-body-s">What you share with Evo</p>
        </Card>
      </div>
      {sent ? (
        <Card className="mt-6">
          <p className="type-title-m">We&apos;ve sent them a code</p>
          <p className="type-body-m text-t2">While you wait, you can keep setting up. Calm tools and crisis support always work.</p>
          <div className="flex gap-2">
            <Pill label="Continue setting up" height={44} href="/onboarding/weighing" />
            <Pill label="Resend" variant="glass" icon={null} height={44} onClick={() => setSent(true)} />
          </div>
        </Card>
      ) : (
        <>
          <label htmlFor="g" className="mt-6 mb-2 block type-label-m">
            Guardian&apos;s number
          </label>
          <div className="glass flex items-center gap-3 rounded-[20px] px-4 py-3">
            <span className="type-title-m">+91</span>
            <input
              id="g"
              inputMode="tel"
              value={digits}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent type-title-m outline-none"
              placeholder="98765 43210"
            />
          </div>
          <Pill
            label="Send them a code"
            disabled={digits.length !== 10}
            className="mt-8 w-full"
            onClick={() => {
              update({ guardianPhone: digits });
              setSent(true);
            }}
          />
        </>
      )}
      <Link href="/crisis" className="mt-6 flex items-center justify-center gap-2 type-label-m text-peach-text">
        <Icon name="lifebuoy" size={16} /> Need help right now?
      </Link>
    </div>
  );
}
