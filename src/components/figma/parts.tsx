"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Exported Figma icon (colour baked in by the design). Sizes are the design's own. */
export function FigmaIcon({ name, size }: { name: string; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- static Figma SVG at its exported size
  return <img src={`/figma/icons/${name}.svg`} alt="" aria-hidden width={size} height={size} className="block shrink-0" />;
}

/** Header row: 100 px tall, 44 px glass back button (Figma "Frame" above every titled screen). */
export function BackRow({ href, children }: { href?: string; children?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="flex h-[100px] w-full items-center gap-2.5">
      <button
        type="button"
        aria-label="Back"
        onClick={() => (href ? router.push(href) : router.back())}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]"
      >
        <FigmaIcon name="chevron-left" size={20} />
      </button>
      {children}
    </div>
  );
}

/** Evo screen title: Medium 28 / 1.1 / −0.7, v3/forest. */
export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn("text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest", className)}>{children}</h1>;
}

/** Evo/Body/M, text/secondary. */
export function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("type-body-m text-t2", className)}>{children}</p>;
}

/** Glass row card: white 78%, blur 12, 1 px white border, radius 20, shadow 0 10 26 / 7%. */
export function GlassCard({ children, className, as: As = "div", ...rest }: { children: ReactNode; className?: string; as?: "div" | "button" } & Record<string, unknown>) {
  return (
    <As
      className={cn("flex w-full items-center gap-3 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]", className)}
      {...rest}
    >
      {children}
    </As>
  );
}

/** Square icon tile with a soft fill. */
export function Tile({ size, radius, bg, children }: { size: number; radius: number; bg: string; children: ReactNode }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center", bg)} style={{ width: size, height: size, borderRadius: radius }}>
      {children}
    </div>
  );
}

/** Evo/Image placeholder (radius 24, dashed lime). Replaced by the generated image when it exists. */
export function ImageSlot({ prompt, height, className }: { prompt: string; height: number; className?: string }) {
  return (
    <div
      role="img"
      aria-label={prompt}
      className={cn("relative flex w-full flex-col items-center justify-center gap-2 rounded-[24px] px-6", className)}
      style={{ height, backgroundImage: "linear-gradient(147.475deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 53.571%, rgb(255,244,228) 85.714%)" }}
    >
      {/* Figma stroke: 1.5 inside, dash 6 / gap 5, v3/lime */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <rect x="0.75" y="0.75" width="calc(100% - 1.5px)" height="calc(100% - 1.5px)" rx="23.25" fill="none" stroke="#88d95f" strokeWidth="1.5" strokeDasharray="6 5" />
      </svg>
      <FigmaIcon name="image" size={26} />
      <p className="text-[11px] font-medium tracking-[0.44px] text-lime-deep">IMAGE · ADD IN FIGMA</p>
      <p className="text-center text-[12px] leading-[1.4] text-t2">{prompt}</p>
    </div>
  );
}

/** Evo toggle (46×28) — the exact on/off artwork from Figma. */
export function FigmaToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="shrink-0 cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element -- Figma toggle artwork */}
      <img src={on ? "/figma/toggle-on.svg" : "/figma/toggle-off.svg"} alt="" width={46} height={28} className="block" />
    </button>
  );
}

/** Settings-style row card (radius 18, p 12): tile 36 + label/caption + trailing control. */
export function RowCard({ icon, tileBg, title, note, children, className }: { icon: string; tileBg: string; title: string; note: string; children?: ReactNode; className?: string }) {
  return (
    <GlassCard className={cn("rounded-[18px] p-3", className)}>
      <Tile size={36} radius={12} bg={tileBg}>
        <FigmaIcon name={icon} size={19} />
      </Tile>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-label-m text-t1">{title}</p>
        <p className="type-caption text-t3">{note}</p>
      </div>
      {children}
    </GlassCard>
  );
}

/** Section label (Evo/Label/S, text/tertiary, uppercase in copy). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="type-label-s text-t3">{children}</p>;
}
