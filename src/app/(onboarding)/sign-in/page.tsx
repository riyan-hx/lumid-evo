"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Heading, StepHeader } from "@/components/onboarding/step-header";
import { Pill } from "@/components/ui/pill";
import { sendCode } from "@/lib/api/auth";
import { useProfile } from "@/lib/profile";

/** 1.2 · Sign in */
function SignIn() {
  const router = useRouter();
  const returning = useSearchParams().get("returning");
  const { profile, update } = useProfile();
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  const pretty = digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await sendCode(digits);
    setBusy(false);
    if (!res.ok) return setError("Check the number — it should be 10 digits.");
    update({ phone: digits });
    router.push(`/verify${returning ? "?returning=1" : ""}`);
  }

  return (
    <form onSubmit={submit}>
      <StepHeader back="/welcome" />
      <Heading title="What's your number?" sub="We'll text you a 6-digit code. No passwords to remember." />
      <div className="glass flex items-center gap-3 rounded-[20px] px-4 py-3">
        <label htmlFor="cc" className="sr-only">
          Country code
        </label>
        <select id="cc" className="bg-transparent type-title-m text-t1" defaultValue="+91">
          <option>+91</option>
        </select>
        <span className="h-6 w-px bg-line-strong" />
        <label htmlFor="phone" className="sr-only">
          Phone number
        </label>
        <input
          id="phone"
          autoFocus
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={pretty}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-transparent type-title-m text-t1 outline-none placeholder:text-t-disabled"
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 type-body-s text-t-danger">
          {error}
        </p>
      )}
      <Pill label={busy ? "Sending…" : "Send code"} type="submit" disabled={digits.length !== 10 || busy} className="mt-8 w-full" />
    </form>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
