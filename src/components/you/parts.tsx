import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { cn } from "@/lib/cn";

export const ROW = "flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]";

/** Settings row that navigates: tile 36 + label/caption + chevron (Figma 9.4). */
export function LinkRow({ href, icon, tileBg, title, note }: { href: string; icon: string; tileBg: string; title: string; note: string }) {
  return (
    <Link href={href} className={ROW}>
      <Tile size={36} radius={12} bg={tileBg}>
        <FigmaIcon name={icon} size={19} />
      </Tile>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label-m text-t1">{title}</span>
        <span className="type-caption text-t3">{note}</span>
      </span>
      <FigmaIcon name="chevron-right" size={18} />
    </Link>
  );
}

/** Screen title block used on 9.3 / 9.4 / 7.7 (no back button). */
export function TabHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex w-full flex-col gap-px">
      <h1 className="type-label-m text-t1">{title}</h1>
      <p className="type-caption text-t3">{sub}</p>
    </div>
  );
}

/** Small info strip at the bottom of 9.5 / 9.7: 30 tile + body-s. */
export function NoteStrip({ icon, tileBg, children, className }: { icon: string; tileBg: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex w-full items-center gap-2.5 rounded-[16px] bg-surface p-3", className)}>
      <Tile size={30} radius={10} bg={tileBg}>
        <FigmaIcon name={icon} size={16} />
      </Tile>
      <p className="flex-1 type-body-s text-t2">{children}</p>
    </div>
  );
}

/** "MR" monogram on the forest gradient. */
export function Monogram({ text, size }: { text: string; size: 28 | 44 }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full type-label-m text-lime" style={{ width: size, height: size, backgroundImage: "linear-gradient(135deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
      {text}
    </span>
  );
}

export const ago = (iso: string, now = Date.now()) => {
  const d = Math.floor((now - new Date(iso).getTime()) / 864e5);
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.floor(d / 7)} weeks ago`;
  return `${Math.floor(d / 30)} months ago`;
};
