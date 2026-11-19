import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Orb } from "./orb";

type MessageProps = {
  role: "evo" | "user" | "system";
  children: ReactNode;
  sub?: ReactNode;
  dark?: boolean;
};

/** Chat message: Evo = white bubble + orb, user = Forest bubble, system = centred pill. */
export function Message({ role, children, sub, dark }: MessageProps) {
  if (role === "system") {
    return (
      <div className="flex justify-center">
        <span className={cn("rounded-full px-2.5 py-1 type-caption", dark ? "bg-white/10 text-white/70" : "bg-white/70 text-t3")}>
          {children}
        </span>
      </div>
    );
  }
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[72%] rounded-[20px] rounded-br-[6px] px-3.5 py-2.5 type-body-m md:max-w-[560px]",
            dark ? "bg-(image:--gradient-lime) text-forest" : "bg-(image:--gradient-forest) text-white",
          )}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <Orb size={24} state="still" />
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 rounded-[20px] rounded-tl-[6px] px-3.5 py-2.5 md:max-w-[560px]",
          dark ? "border border-white/18 bg-white/10 text-white" : "border border-line-strong bg-surface text-t1 shadow-[0_6px_16px_rgba(21,26,19,0.06)]",
        )}
      >
        <div className="type-body-m">{children}</div>
        {sub && <div className={cn("type-caption", dark ? "text-lime" : "text-t3")}>{sub}</div>}
      </div>
    </div>
  );
}
