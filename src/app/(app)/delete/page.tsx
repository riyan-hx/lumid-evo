"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RowCard } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { RoundButton } from "@/components/safety/parts";
import { Pill } from "@/components/ui/pill";
import { requestDeletion } from "@/lib/api/account";
import { circle } from "@/lib/circle";
import { evoKeys } from "@/lib/store";

function exportAll() {
  const data = Object.fromEntries(evoKeys().map((k) => [k, JSON.parse(localStorage.getItem(k) ?? "null")]));
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `evo-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 9.8 · Delete, honestly — Figma node 130:2849. */
export default function Delete() {
  const router = useRouter();
  const [who, setWho] = useState<{ name: string; first: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const c = circle.get()?.clinician;
    setWho(c ? { name: c.short, first: c.first } : null); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
  }, []);

  return (
    <FigmaScreen gap={12} mood="warm">
      <div className="flex h-[100px] w-full items-center">
        <RoundButton icon="close" label="Close" onClick={() => router.back()} />
      </div>
      <h1 className="type-flow-title text-forest">Delete everything?</h1>
      <p className="type-body-m text-t2">Here&apos;s exactly what happens. No tricks.</p>
      <RowCard icon="trash-danger-19" tileBg="bg-danger-subtle" title="Chats, check-ins, memories" note="Removed from our servers within 30 days" />
      <RowCard icon="timer-sun-19" tileBg="bg-sun-soft" title="7 days to change your mind" note="Sign in again to cancel" />
      {who && <RowCard icon="stethoscope-mint" tileBg="bg-mint-soft" title="What you already shared" note={`Stays with ${who.name} — ask ${who.first} about it`} />}
      <button type="button" onClick={exportAll} className="w-full cursor-pointer text-left">
        <RowCard icon="file-sky-19" tileBg="bg-sky-soft" title="Want a copy first?" note="Export everything as a file" />
      </button>
      <label className="flex w-full flex-col gap-1.5 rounded-[18px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
        <span className="type-caption text-t3">Type DELETE to confirm</span>
        <input value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} autoCapitalize="characters" spellCheck={false} className="w-full bg-transparent type-title-l text-t1 outline-none" />
      </label>
      <Grow />
      <button
        type="button"
        disabled={typed !== "DELETE" || busy}
        onClick={async () => {
          setBusy(true);
          await requestDeletion();
          evoKeys().forEach((k) => localStorage.removeItem(k));
          window.location.assign("/welcome"); // eslint-disable-line @next/next/no-location-assign-relative-destination -- full reload resets every in-memory store
        }}
        className="w-full cursor-pointer rounded-full bg-t-danger py-[17px] type-label-m text-white shadow-[0_12px_22px_-8px_rgba(21,26,19,0.2)] disabled:cursor-not-allowed"
      >
        Delete my account
      </button>
      <Pill label="Keep my account" variant="glass" icon={null} className="w-full" onClick={() => router.push("/settings")} />
    </FigmaScreen>
  );
}
