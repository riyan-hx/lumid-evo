"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";
import { pay, type PlanId, PRICES } from "@/lib/api/billing";
import { cn } from "@/lib/cn";
import { sub } from "@/lib/plan";

const FREE = ["Crisis support, safety plan and the safety net", "Check-ins, chat, CBT thought records", "Calm space, small steps and the ladder"];
const PLUS = ["Monthly pattern report", "Malayalam voice, transcribed on our servers", "Guided audio for every calm tool", "Deeper insights across months"];

/** 9.9 · Evo Plus — Figma node 130:2930. Help is never behind the paywall. */
export default function Plus() {
  const router = useRouter();
  const toast = useToast();
  const [plan, setPlan] = useState<PlanId>("year");
  const [has, setHas] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setHas(sub.isPlus()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage

  return (
    <FigmaScreen gap={12}>
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="close" label="Close" onClick={() => router.back()} />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="flex size-11 items-center justify-center rounded-[15px] bg-lime-soft">
          <FigmaIcon name="crown-limedeep-23" size={23} />
        </span>
        <h1 className="text-[30px] leading-[1.1] font-medium tracking-[-0.75px] text-forest">Evo Plus</h1>
      </div>
      <p className="type-body-m text-t2">Go deeper — never pay for help.</p>
      <div className="flex w-full flex-col gap-2 rounded-[22px] border border-white bg-white/78 p-4 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <p className="type-label-s text-lime-deep">ALWAYS FREE</p>
        {FREE.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <FigmaIcon name="check-limedeep-18b" size={18} />
            <p className="flex-1 type-body-s text-t1">{f}</p>
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[22px] p-4" style={{ backgroundImage: "linear-gradient(156.22deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
        <p className="type-label-s text-lime">PLUS ADDS</p>
        {PLUS.map((f) => (
          <div key={f} className="flex items-center gap-2">
            <FigmaIcon name="sparkle-lime-16" size={16} />
            <p className="flex-1 type-body-s text-white">{f}</p>
          </div>
        ))}
      </div>
      <div role="radiogroup" aria-label="Plan" className="flex w-full gap-2.5">
        {(Object.keys(PRICES) as PlanId[]).map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={plan === id}
            onClick={() => setPlan(id)}
            className={cn(
              "flex flex-1 cursor-pointer flex-col items-start gap-0.5 rounded-[20px] p-3.5 text-left shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]",
              plan === id ? "border-2 border-lime bg-lime-soft" : "border border-white bg-white/78",
            )}
          >
            <span className="type-title-l text-forest">{PRICES[id].amount}</span>
            <span className="type-caption text-t3">{PRICES[id].note}</span>
          </button>
        ))}
      </div>
      <Grow />
      {has ? (
        <Pill label="You're on Evo Plus" variant="glass" icon={null} className="w-full" onClick={() => router.push("/settings")} />
      ) : (
        <Pill
          label={busy ? "Waiting for UPI…" : "Continue with UPI"}
          className="w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const r = await pay(plan, "upi");
            if (r.ok) {
              sub.activate(plan);
              toast.show("Welcome to Evo Plus");
              router.push("/settings");
            } else router.push(`/plus/retry?plan=${plan}`);
          }}
        />
      )}
    </FigmaScreen>
  );
}
