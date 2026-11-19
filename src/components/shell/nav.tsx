"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { NAV } from "./nav-items";

const isActive = (path: string, href: string) => path === href || path.startsWith(href + "/");

/** Always one tap away, on every screen (Dev Docs board 07 · safety requirements). */
export function CrisisLink({ compact }: { compact?: boolean }) {
  return (
    <Link
      href="/crisis"
      className={cn(
        "flex items-center gap-2 rounded-full bg-peach-subtle text-peach-text type-label-s",
        compact ? "size-11 justify-center" : "px-3.5 py-2.5",
      )}
      aria-label="Crisis support"
    >
      <Icon name="lifebuoy" size={18} />
      {!compact && "Crisis support"}
    </Link>
  );
}

/** Desktop ≥ 1200: sidebar 248. Tablet 768–1199: icon rail 72. */
export function SideNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="sticky top-0 hidden h-dvh shrink-0 flex-col justify-between border-r border-line bg-paper/80 py-6 backdrop-blur md:flex md:w-[72px] md:items-center desk:w-[248px] desk:items-stretch desk:px-4"
    >
      <div className="flex flex-col gap-1 md:items-center desk:items-stretch">
        <Link href="/home" className="mb-6 flex items-center gap-2.5 desk:px-2">
          <Orb size={32} state="still" />
          <span className="hidden type-title-m text-forest desk:inline">Evo</span>
        </Link>
        {NAV.map((n) => {
          const active = isActive(path, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              title={n.label}
              className={cn(
                "flex items-center gap-3 rounded-full type-label-m transition-colors md:size-11 md:justify-center desk:h-11 desk:w-auto desk:justify-start desk:px-3.5",
                active ? "bg-forest text-white" : "text-t2 hover:bg-white/70",
              )}
            >
              <Icon name={n.icon} size={20} />
              <span className="hidden desk:inline">{n.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="hidden desk:block">
        <CrisisLink />
      </div>
      <div className="desk:hidden">
        <CrisisLink compact />
      </div>
    </nav>
  );
}

/** Mobile web < 768: bottom nav with the four designed tabs. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="glass fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 flex items-center justify-between rounded-full p-1.5 md:hidden"
    >
      {NAV.filter((n) => n.mobile).map((n) => {
        const active = isActive(path, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            aria-label={n.label}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-full type-label-m transition-all",
              active ? "flex-[1.6] bg-forest text-white" : "flex-1 text-t2",
            )}
          >
            <Icon name={n.icon} size={20} />
            {active && n.label}
          </Link>
        );
      })}
    </nav>
  );
}
