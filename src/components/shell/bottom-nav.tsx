"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/home", label: "Home", glyph: "home", match: ["/home", "/first-day"] },
  { href: "/chat", label: "Chat", glyph: "chat", match: ["/chat", "/chats"] },
  { href: "/voice", label: "Voice", glyph: "voice", match: ["/voice"] },
  { href: "/settings", label: "Settings", glyph: "settings", match: ["/settings", "/journal", "/insights/week"] },
];

/** Screens that show the nav in Figma (tab roots). Flow screens (check-in steps, tools…) don't. */
const SHOWN = ["/home", "/first-day", "/chat", "/chats", "/voice", "/settings", "/journal", "/insights/week"];

/**
 * Evo DS "Bottom Nav" (Figma 1:188), exact: floating pill, dashed border, 60 px circles,
 * active tab expands into a pill with a bg/brand-strong circle and a label.
 */
export function BottomNav() {
  const path = usePathname();
  if (!SHOWN.includes(path)) return null;
  const active = TABS.find((t) => t.match.some((m) => path === m || path.startsWith(m + "/")))?.href;
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-[22px] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-[1.2px] border-dashed border-line-strong bg-white/82 p-1.5 drop-shadow-[0_12px_16px_rgba(15,36,26,0.12)] backdrop-blur-[12px] md:hidden"
    >
      {TABS.map((t) => {
        const on = t.href === active;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-label={t.label}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex items-center gap-3.5 overflow-hidden rounded-full bg-muted p-1 transition-[width,padding] duration-300 ease-(--ease-out-evo) active:scale-[0.94]",
              on ? "pr-[22px]" : "w-[60px]",
            )}
          >
            <span className={cn("flex size-[52px] shrink-0 items-center justify-center rounded-full", on && "bg-brand-strong")}>
              {/* eslint-disable-next-line @next/next/no-img-element -- Figma glyph */}
              <img src={`/figma/nav/${t.glyph}-${on ? "on" : "off"}.svg`} alt="" width={22} height={22} />
            </span>
            {on && <span className="type-label-m whitespace-nowrap text-t1">{t.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
