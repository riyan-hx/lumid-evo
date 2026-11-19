"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";
import { type Method, pay, type PlanId } from "@/lib/api/billing";
import { GRACE_DAYS, sub } from "@/lib/plan";

/** 9.10 · Payment didn't go through — Figma node 130:3016. Nothing charged; an existing Plus stays on for 3 days. */
function Retry() {
  const router = useRouter();
  const toast = useToast();
  const plan = (useSearchParams().get("plan") as PlanId) || "year";
  const [grace, setGrace] = useState(false);
  const [busy, setBusy] = useState<Method | null>(null);
  useEffect(() => {
    sub.failed();
    setGrace(sub.get().tier === "plus"); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);

  const retry = async (m: Method) => {
    setBusy(m);
    const r = await pay(plan, m);
    setBusy(null);
    if (!r.ok) return toast.show("Still didn't go through. Nothing was charged.");
    sub.activate(plan);
    toast.show("Payment done. Welcome to Evo Plus");
    router.push("/settings");
  };

  return (
    <FigmaScreen gap={14}>
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="close" label="Close" onClick={() => router.push("/settings")} />
      </div>
      <div className="flex w-full justify-center">
        <span className="flex size-20 items-center justify-center rounded-[27px] bg-sun-soft">
          <FigmaIcon name="refresh-sun-42" size={42} />
        </span>
      </div>
      <h1 className="text-center type-flow-title text-forest">Payment didn&apos;t go through</h1>
      <p className="text-center type-body-m text-t2">UPI timed out. Nothing was charged.</p>
      {grace && (
        <div className="flex w-full flex-col gap-1.5 rounded-[24px] border border-white p-[18px]" style={{ backgroundImage: "linear-gradient(159.35deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}>
          <p className="type-label-s text-lime-deep">PLUS STAYS ON</p>
          <p className="type-title-l text-forest">{GRACE_DAYS} days to sort it out</p>
          <p className="type-body-s text-t2">Everything keeps working while you retry. After that you move to Free — nothing you made is deleted.</p>
        </div>
      )}
      <Grow />
      <Pill label={busy === "upi" ? "Waiting for UPI…" : "Try UPI again"} className="w-full" disabled={!!busy} onClick={() => retry("upi")} />
      <Pill label={busy === "card" ? "Opening card…" : "Use a card instead"} variant="glass" icon={null} className="w-full" disabled={!!busy} onClick={() => retry("card")} />
      <button
        type="button"
        onClick={() => {
          sub.free();
          router.push("/settings");
        }}
        className="w-full cursor-pointer text-center type-label-m text-t2"
      >
        Stay on Free
      </button>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Retry />
    </Suspense>
  );
}
