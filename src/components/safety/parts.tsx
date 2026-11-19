import Link from "next/link";
import type { ReactNode } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { cn } from "@/lib/cn";

/** Contact row used on 8.3 / 8.4: 40 tile + title/note + trailing number or chevron. */
export function SupportRow({ href, icon, bg, title, note, trailing }: { href: string; icon: string; bg: string; title: string; note: string; trailing?: ReactNode }) {
  return (
    <Link href={href} className="flex w-full items-center gap-3 rounded-[20px] border border-white bg-white/78 p-3 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[13px]", bg)}>
        <FigmaIcon name={icon} size={21} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label-m text-t1">{title}</span>
        <span className="truncate type-caption text-t3">{note}</span>
      </span>
      {trailing ?? <FigmaIcon name="chevron-right" size={18} />}
    </Link>
  );
}

export const Hotline = ({ children }: { children: ReactNode }) => <span className="type-title-l text-peach-text">{children}</span>;

/** Round 44 glass button (back / close). */
export function RoundButton({ icon, label, onClick }: { icon: "close" | "chevron-left"; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/78 backdrop-blur-[12px]">
      <FigmaIcon name={icon} size={20} />
    </button>
  );
}
