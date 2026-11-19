"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { FigmaIcon, FlowHeader } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Pill } from "@/components/ui/pill";
import { useCheckIns } from "@/lib/checkins";
import { decide } from "@/lib/router";
import { WHEEL, type WheelNode } from "@/lib/wheel";

/** Satellite pill positions around the wheel (Figma 134:3038, 345×250 frame). */
const SPOTS = [
  { left: 56, top: 26 },
  { left: 220, top: 26 },
  { left: 50, top: 196 },
  { left: 224, top: 200 },
];
const DARK = "linear-gradient(135deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)";

/** C4 · Feelings wheel — Figma node 134:3013 */
export default function FeelingsWheel() {
  const router = useRouter();
  const { add, items } = useCheckIns();
  const [path, setPath] = useState<WheelNode[]>([]);
  const current = path[path.length - 1];
  const options = current ? (current.children ?? []) : WHEEL;
  const atLeaf = !!current && !current.children;
  const parent = atLeaf ? path[path.length - 2] : undefined;
  const pick = (n: WheelNode) => {
    if (n === parent) return setPath(path.slice(0, -1)); // tapping the parent goes back up a level
    setPath((p) => (atLeaf ? [...p.slice(0, -1), n] : [...p, n]));
  };

  function save() {
    if (!current) return;
    const item = add({ style: "wheel", feeling: current.feeling, word: current.name.toLowerCase(), intensity: 60 });
    router.push(decide(item, items).safety ? "/check-in/low" : "/check-in?step=reflect");
  }

  const centre = current?.name ?? "Start here";
  const split = centre.length > 9 && !centre.includes(" ") ? [centre.slice(0, 4) + "-", centre.slice(4)] : [centre];
  // At a precise word: the parent first, then the other words (Figma order).
  const leafOptions = atLeaf && parent ? [parent, ...(parent.children ?? []).filter((n) => n !== current)] : options;

  return (
    <FigmaScreen gap={12} mood="calm">
      <FlowHeader solid icon="close" label="Close check-in" title="Check-in" sub="Feelings wheel" onClick={() => router.push("/home")} />
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">Let&apos;s find the exact word.</h1>
      <p className="type-body-m text-t2">Start big, then get specific.</p>
      <nav aria-label="Your path" className="flex min-h-[30px] w-full flex-wrap items-center gap-1.5">
        {path.map((n, i) => (
          <Fragment key={n.name + i}>
            {i > 0 && <FigmaIcon name="chevron-right-14" size={14} />}
            <button
              type="button"
              onClick={() => setPath(path.slice(0, i + 1))}
              className="cursor-pointer rounded-full px-3 py-[7px] type-label-s"
              style={i === path.length - 1 ? { backgroundImage: DARK, color: "#fff" } : { background: "var(--color-sky-soft)", color: "var(--color-sky-text)" }}
            >
              {n.name}
            </button>
          </Fragment>
        ))}
      </nav>
      <div className="relative flex h-[250px] w-full items-center justify-center">
        <div className="flex size-[240px] items-center justify-center rounded-[120px] bg-sky-soft">
          <div className="flex size-[170px] items-center justify-center rounded-[85px] bg-lavender-soft">
            <div className="flex size-[100px] flex-col items-center justify-center rounded-[50px] text-center type-label-m text-white" style={{ backgroundImage: DARK }}>
              {split.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-y-0 left-1/2 w-[345px] -translate-x-1/2">
          {leafOptions.slice(0, 4).map((n, i) => (
            <button
              key={n.name}
              type="button"
              aria-pressed={false}
              onClick={() => pick(n)}
              className="absolute cursor-pointer rounded-full border border-line-strong bg-surface px-2.5 py-1.5 type-caption text-t1"
              style={SPOTS[i]}
            >
              {n.name}
            </button>
          ))}
        </div>
      </div>
      {current && (
        <div className="flex w-full flex-col gap-1.5 rounded-[20px] border border-white bg-surface p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)]">
          <p className="type-label-s text-t3">{current.name.toUpperCase()} MEANS</p>
          <p className="type-body-m text-t1">{current.means}</p>
        </div>
      )}
      <Grow />
      <Pill label={current && !current.children ? "That's the one" : "Pick a feeling"} className="w-full" onClick={() => (current && !current.children ? save() : undefined)} />
    </FigmaScreen>
  );
}
