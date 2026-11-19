import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { tone as tones, type Tone } from "@/lib/tone";

type CardProps = {
  children: ReactNode;
  variant?: "glass" | "solid" | "tint";
  tone?: Tone;
  className?: string;
};

/** Evo card: glass (default), solid white, or a soft accent tint. */
export function Card({ children, variant = "glass", tone = "lime", className }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-[20px] p-3.5",
        variant === "glass" && "glass",
        variant === "solid" && "border border-line-strong bg-surface",
        variant === "tint" && tones[tone].soft,
        className,
      )}
    >
      {children}
    </div>
  );
}
