"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Pill } from "@/components/ui/pill";
import { DEV_CODE, sendCode, verifyCode } from "@/lib/api/auth";
import { cn } from "@/lib/cn";
import { useProfile } from "@/lib/profile";

const LEN = 6;
const MAX_TRIES = 5;

/** 1.2 → 1.3 · Verify code (wrong / expired / locked states) */
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
    setCode("");
  }

  // Refocus once the input is re-enabled after a wrong code.
  useEffect(() => {
    if (state === "wrong") input.current?.focus();
  }, [state]);

  function onChange(v: string) {
    const d = v.replace(/\D/g, "").slice(0, LEN);
    setCode(d);
    if (state === "wrong") setState("idle");
    if (d.length === LEN) check(d);
  }

  const pretty = profile.phone ? `+91 ${profile.phone.slice(0, 5)} ${profile.phone.slice(5)}` : "your number";

  return (
    <div>
      <StepHeader back="/sign-in" />
      <Heading title="Enter the 6-digit code" />
      <p className="-mt-4 mb-6 type-body-m text-t2">
        Sent to {pretty} ·{" "}
        <Link href="/sign-in" className="text-lime-deep">
          Change
        </Link>
      </p>
      <label className="relative block" onClick={() => input.current?.focus()}>
        <span className="sr-only">One-time code</span>
        <input
          ref={input}
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          disabled={state === "locked" || state === "checking"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0"
        />
        <div className={cn("flex justify-between gap-2", state === "wrong" && "motion-safe:animate-[shake_0.3s]")} aria-hidden>
          {Array.from({ length: LEN }, (_, i) => (
            <span
              key={i}
              className={cn(
                "flex h-14 flex-1 items-center justify-center rounded-[16px] border bg-white/80 type-title-m",
                state === "wrong" ? "border-peach-solid" : i === code.length ? "border-lime-deep" : "border-white",
              )}
            >
              {code[i] ?? ""}
            </span>
          ))}
        </div>
      </label>
      <div className="mt-3 min-h-10" role="status">
        {state === "wrong" && <p className="type-body-s text-t-danger">That code didn&apos;t match. Try again or get a new one.</p>}
        {state === "locked" && <p className="type-body-s text-t-danger">Too many tries. Wait 15 minutes, or ask for help below.</p>}
        {state === "checking" && <p className="type-body-s text-t3">Checking…</p>}
        <p className="type-caption text-t3">Codes work for 10 minutes. A new code replaces the old one.</p>
        {process.env.NODE_ENV !== "production" && <p className="type-caption text-lime-deep">Dev: use {DEV_CODE}</p>}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Pill
          label={resendIn > 0 ? `Resend in 0:${String(resendIn).padStart(2, "0")}` : "Resend code"}
          variant="glass"
          icon={null}
          disabled={resendIn > 0}
          onClick={async () => {
            await sendCode(profile.phone);
            setResendIn(30);
          }}
        />
        <Link href="mailto:help@lumid.app" className="text-center type-label-m text-t2">
          No code? Get help
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
