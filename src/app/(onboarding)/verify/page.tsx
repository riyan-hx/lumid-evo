"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BackRow, Body, FigmaIcon, GlassCard, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { SoftChip } from "@/components/ui/controls";
import { Pill } from "@/components/ui/pill";
import { DEV_CODE, sendCode, verifyCode } from "@/lib/api/auth";
import { cn } from "@/lib/cn";
import { useProfile } from "@/lib/profile";

const LEN = 6;
const MAX_TRIES = 5;

/** 1.3 · Code (incl. wrong-code state) — Figma node 112:1421 */
function Verify() {
  const router = useRouter();
  const returning = useSearchParams().get("returning");
  const { profile, update } = useProfile();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "wrong" | "locked">("idle");
  const [tries, setTries] = useState(0);
  const [resendIn, setResendIn] = useState(30);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (state === "wrong") {
      input.current?.focus();
      input.current?.select(); // the next code replaces the wrong one
    }
  }, [state]);

  async function check(value: string) {
    setState("checking");
    const res = await verifyCode(profile.phone, value);
    if (res.ok) {
      if (returning) {
        update({ onboarded: true });
        router.push("/home");
      } else router.push("/age");
      return;
    }
    const n = tries + 1;
    setTries(n);
    setState(n >= MAX_TRIES ? "locked" : "wrong");
  }

  function onChange(v: string) {
    const d = v.replace(/\D/g, "").slice(0, LEN);
    setCode(d);
    if (state === "wrong") setState("idle");
    if (d.length === LEN) check(d);
  }

  const wrong = state === "wrong" || state === "locked";
  const pretty = profile.phone ? `+91 ${profile.phone.slice(0, 5)} ${profile.phone.slice(5)}` : "your number";
  const left = MAX_TRIES - tries;

  return (
    <FigmaScreen gap={18}>
      <BackRow href="/sign-in" />
      <Title>Enter the 6-digit code</Title>
      <Body>
        Sent to {pretty} ·{" "}
        <Link href="/sign-in" className="underline-offset-2 hover:underline">
          Change
        </Link>
      </Body>
      <label className="relative flex w-full gap-2">
        <span className="sr-only">One-time code</span>
        <input
          ref={input}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          disabled={state === "locked" || state === "checking"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 z-10 cursor-text opacity-0"
        />
        {Array.from({ length: LEN }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "flex h-[58px] flex-1 items-center justify-center rounded-[16px] border-[1.5px] bg-surface text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-t1",
              wrong ? "border-t-danger" : i === code.length ? "border-lime" : "border-white",
            )}
          >
            {code[i] ?? ""}
          </span>
        ))}
      </label>
      {wrong && (
        <div role="alert" className="flex w-full items-center gap-2.5 rounded-[16px] bg-danger-subtle p-3">
          <FigmaIcon name="alert-danger" size={20} />
          <p className="flex-1 type-body-s text-t-danger">
            {state === "locked" ? "Too many tries. Wait 15 minutes, or get help below." : `That code didn't match. ${left} tries left — take your time.`}
          </p>
        </div>
      )}
      <div className="flex w-full gap-2">
        <SoftChip
          label={resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, "0")}` : "Resend code"}
          onClick={async () => {
            if (resendIn > 0) return;
            await sendCode(profile.phone);
            setResendIn(30);
          }}
        />
        <SoftChip label="No code? Get help" onClick={() => (window.location.href = "mailto:help@lumid.app")} />
      </div>
      <GlassCard className="p-3">
        <Tile size={36} radius={12} bg="bg-sun-soft">
          <FigmaIcon name="clock-sun" size={19} />
        </Tile>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="type-label-m text-t1">Codes work for 10 minutes</p>
          <p className="type-caption text-t3">
            A new code replaces the old one{process.env.NODE_ENV !== "production" ? ` · dev code ${DEV_CODE}` : ""}
          </p>
        </div>
      </GlassCard>
      <Grow />
      <Pill label={state === "checking" ? "Checking…" : "Verify"} disabled={state === "checking" || state === "locked"} className="w-full" onClick={() => (code.length === LEN ? check(code) : input.current?.focus())} />
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
