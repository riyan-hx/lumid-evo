import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/pill";

/** Skeleton block in the shape of the content it replaces (no full-page spinners). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-[20px] bg-[linear-gradient(90deg,#eef1ec_0%,#f8faf6_50%,#eef1ec_100%)] bg-[length:200%_100%]", className)}
      style={{ animation: "evo-shimmer 1.4s linear infinite" }}
    />
  );
}

/** One friendly line + one action. No sad illustrations, no guilt copy. */
export function EmptyState({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="glass flex flex-col items-start gap-3 rounded-[24px] p-6">
      <p className="type-body-l text-t2">{title}</p>
      {action && <Pill label={action} height={44} href={href} />}
    </div>
  );
}

/** Recoverable error: what happened + Retry. The caller keeps the user's input. */
export function ErrorCard({ message, onRetry, children }: { message: string; onRetry?: () => void; children?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-[20px] border border-peach-soft bg-peach-subtle p-4">
      <p className="type-body-m text-t1">{message}</p>
      {children}
      {onRetry && <Pill label="Try again" variant="glass" height={40} icon={null} onClick={onRetry} className="self-start" />}
    </div>
  );
}
