import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Glow layers exactly as in the Figma frames (blurred ellipses exported as SVG, incl. blur bleed). */
const GLOWS = {
  day: [
    { src: "/figma/glow/day-1.svg", x: 50, y: -240, w: 660, h: 580 },
    { src: "/figma/glow/day-2.svg", x: -220, y: 200, w: 460, h: 440 },
    { src: "/figma/glow/day-3.svg", x: 100, y: 460, w: 500, h: 480 },
    { src: "/figma/glow/day-4.svg", x: -240, y: 600, w: 520, h: 500 },
  ],
  calm: [
    { src: "/figma/glow/calm-1.svg", x: 10, y: -220, w: 640, h: 580 },
    { src: "/figma/glow/calm-2.svg", x: -230, y: 230, w: 500, h: 480 },
    { src: "/figma/glow/calm-3.svg", x: 100, y: 540, w: 500, h: 480 },
  ],
} as const;

export type Mood = keyof typeof GLOWS;

type Props = {
  children: ReactNode;
  mood?: Mood;
  /** Auto-layout gap of the Figma frame. */
  gap?: number;
  /** Top padding of the Figma frame (status bar area included). */
  pt?: number;
  className?: string;
};

/**
 * A Figma 393×852 screen, rendered 1:1: v3/bg, glows, 24 px sides, 28 px bottom.
 * Fills the viewport height; on wider viewports the 393-wide design column is centred.
 */
export function FigmaScreen({ children, mood = "day", gap = 18, pt = 58, className }: Props) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-paper">
      <div className="relative mx-auto w-full max-w-[430px]">
        {GLOWS[mood].map((g) => (
          // eslint-disable-next-line @next/next/no-img-element -- decorative Figma asset, fixed geometry
          <img key={g.src} src={g.src} alt="" aria-hidden width={g.w} height={g.h} className="pointer-events-none absolute max-w-none select-none" style={{ left: g.x, top: g.y }} />
        ))}
        <div className={cn("relative flex min-h-dvh flex-col items-stretch px-6 pb-7", className)} style={{ gap, paddingTop: pt }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Spacer frame (flex 1) used in every Figma screen above the bottom CTA. */
export function Grow() {
  return <div className="min-h-px flex-1" />;
}
