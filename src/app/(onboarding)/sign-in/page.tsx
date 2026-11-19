"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BackRow, Body, FigmaIcon, Tile, Title } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { sendCode } from "@/lib/api/auth";
import { useProfile } from "@/lib/profile";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

/** 1.2 · Sign in — Figma node 112:1349 */
function SignIn() {
  const router = useRouter();
  const returning = useSearchParams().get("returning");
  const { profile, update } = useProfile();
  const [digits, setDigits] = useState(profile.phone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pretty = digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

  const press = (k: string) => {
    setError("");
    if (k === "⌫") setDigits((d) => d.slice(0, -1));
    else if (k) setDigits((d) => (d.length < 10 ? d + k : d));
  };

  async function submit() {
    if (digits.length !== 10) return setError("Check the number — it should be 10 digits.");
    setBusy(true);
    const res = await sendCode(digits);
    setBusy(false);
    if (!res.ok) return setError("Check the number — it should be 10 digits.");
    update({ phone: digits });
    router.push(`/verify${returning ? "?returning=1" : ""}`);
  }

  return (
    <FigmaScreen gap={18}>
      <BackRow href="/welcome" />
      <Title>What&apos;s your number?</Title>
      <Body>We text a 6-digit code. Your number is your account — no passwords.</Body>
      <label className="flex w-full items-center gap-2.5 rounded-[30px] border border-lime bg-surface p-1.5 shadow-[0_12px_28px_rgba(21,26,19,0.1)]">
        <span className="rounded-[24px] bg-lime-soft p-3.5 type-label-m text-forest">+91</span>
        <span className="sr-only">Phone number</span>
        <input
          id="phone"
          inputMode="numeric"
          autoComplete="tel-national"
          value={pretty}
          placeholder="98765 43210"
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="w-full bg-transparent text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-t1 outline-none placeholder:text-t-disabled"
        />
      </label>
      <div className="flex w-full items-center gap-2.5">
        <Tile size={30} radius={10} bg="bg-lime-soft">
          <FigmaIcon name="shield-limedeep" size={16} />
        </Tile>
        <p className={error ? "type-body-s text-t-danger" : "type-body-s text-t2"} role={error ? "alert" : undefined}>
          {error || "Never shown to anyone. Never used for ads."}
        </p>
      </div>
      <Grow />
      <div className="flex w-full flex-col gap-2 rounded-[24px] bg-surface p-2.5">
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="flex gap-2">
            {KEYS.slice(r * 3, r * 3 + 3).map((k, i) =>
              k ? (
                <button
                  key={k}
                  type="button"
                  aria-label={k === "⌫" ? "Delete" : k}
                  onClick={() => press(k)}
                  className="flex h-[46px] flex-1 cursor-pointer items-center justify-center rounded-[14px] bg-surface text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-t1 active:bg-subtle"
                >
                  {k}
                </button>
              ) : (
                <span key={`e${i}`} className="h-[46px] flex-1" />
              ),
            )}
          </div>
        ))}
      </div>
      <Pill label={busy ? "Sending…" : "Send code"} disabled={busy} className="w-full" onClick={submit} />
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
