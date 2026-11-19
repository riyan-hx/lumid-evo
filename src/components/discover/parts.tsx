import type { ReactNode } from "react";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { cn } from "@/lib/cn";

/** O-screens header: 44 glass button (white 85%) + title / caption. */
export function OHeader({ icon, label, title, sub, onClick, dark }: { icon: "close" | "chevron-left"; label: string; title: string; sub: string; onClick: () => void; dark?: boolean }) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn("flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] border backdrop-blur-[12px]", dark ? "border-white/20 bg-white/12" : "border-white bg-white/85")}
      >
        <FigmaIcon name={dark ? "close-white" : icon} size={20} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <p className={cn("type-label-m", dark ? "text-white" : "text-t1")}>{title}</p>
        <p className={cn("type-caption", dark ? "text-lime" : "text-t3")}>{sub}</p>
      </div>
    </div>
  );
}

export const CARD = "rounded-[18px] border border-white bg-white/85 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]";

/** Row: tile 36 + title / note + trailing. */
export function ORow({ icon, tileBg, title, note, children, className, tileSize = 36 }: { icon: string; tileBg: string; title: string; note: string; children?: ReactNode; className?: string; tileSize?: 32 | 36 }) {
  return (
    <div className={cn("flex w-full items-center gap-3 p-3", CARD, className)}>
      <Tile size={tileSize} radius={tileSize === 36 ? 12 : 11} bg={tileBg}>
        <FigmaIcon name={icon} size={tileSize === 36 ? 19 : 17} />
      </Tile>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="type-label-m text-t1">{title}</span>
        <span className="type-caption text-t3">{note}</span>
      </span>
      {children}
    </div>
  );
}

/** Static waveform heights from Figma O2. */
export const WAVE = [10, 22, 36, 18, 48, 30, 14, 40, 26, 52, 20, 34, 12, 44, 24, 16];

export function Waveform({ live }: { live?: boolean }) {
  return (
    <div className="flex h-14 items-center gap-1" aria-hidden>
      {WAVE.map((h, i) => (
        <span key={i} className={cn("w-[5px] rounded-[3px]", live && "evo-wave")} style={{ height: h, backgroundImage: "var(--gradient-lime)", animationDelay: `${(i % 5) * 120}ms` }} />
      ))}
    </div>
  );
}
