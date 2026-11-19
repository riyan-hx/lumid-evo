"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { EMPTY_PLAN, PLAN_STEPS, plan, type SafetyPlan } from "@/lib/safety";

type Key = keyof Omit<SafetyPlan, "updatedAt">;
const FIELD = "w-full resize-none rounded-[12px] border border-line bg-white px-3 py-2 type-body-s text-t1 outline-none focus:border-lime-deep";

/** 8.5 · My safety plan — Figma node 127:2439. Kept on the device, readable offline. */
export default function SafetyPlanPage() {
  const router = useRouter();
  const [p, setP] = useState<SafetyPlan>(EMPTY_PLAN);
  const [open, setOpen] = useState<Key | null>(null);
  useEffect(() => setP(plan.get()), []); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage

  const set = (k: Key, v: string) => setP((x) => ({ ...x, [k]: v }));
  const close = () => {
    plan.save(p);
    setOpen(null);
  };
  const editor = (k: Key, label: string, hint: string) => (
    <div className="flex w-full flex-col gap-2">
      <textarea aria-label={label} autoFocus rows={2} value={p[k]} placeholder={hint} onChange={(e) => set(k, e.target.value)} className={FIELD} />
      <button type="button" onClick={close} className="self-end cursor-pointer rounded-full bg-forest px-3.5 py-1.5 type-label-s text-white">
        Save
      </button>
    </div>
  );

  return (
    <FigmaScreen gap={10} mood="warm">
      <div className="flex w-full items-center gap-2.5">
        <RoundButton icon="chevron-left" label="Back" onClick={() => router.back()} />
        <div className="flex flex-1 flex-col gap-px">
          <h1 className="type-label-m text-t1">My safety plan</h1>
          <p className="type-caption text-t3">Made on a calmer day · always offline</p>
        </div>
      </div>
      {PLAN_STEPS.map((s, i) => (
        <div key={s.key} className="flex w-full items-start gap-3 rounded-[18px] border border-white bg-white/78 p-[11px] shadow-[0_8px_22px_rgba(21,26,19,0.06)] backdrop-blur-[12px]">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full type-caption text-lime" style={{ backgroundImage: "var(--gradient-forest)" }}>
            {i + 1}
          </span>
          {open === s.key ? (
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="type-label-m text-t1">{s.title}</p>
              {editor(s.key, s.title, s.hint)}
            </div>
          ) : (
            <button type="button" onClick={() => setOpen(s.key)} className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-left">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="type-label-m text-t1">{s.title}</span>
                <span className="w-[230px] max-w-full type-caption text-t3">{p[s.key] || s.hint}</span>
              </span>
              <FigmaIcon name="pencil-t3-16" size={16} />
            </button>
          )}
        </div>
      ))}
      <div className="flex w-full items-center gap-2.5 rounded-[18px] p-3.5" style={{ backgroundImage: "var(--gradient-forest)" }}>
        <FigmaIcon name="heart-lime-18" size={18} />
        {open === "reason" ? (
          <div className="flex-1">{editor("reason", "My reason to stay", "Someone or something worth staying for")}</div>
        ) : (
          <button type="button" onClick={() => setOpen("reason")} className="flex-1 cursor-pointer text-left type-body-s text-white">
            My reason to stay: {p.reason ? `"${p.reason}"` : <span className="text-white/60">tap to add</span>}
          </button>
        )}
      </div>
    </FigmaScreen>
  );
}
