import type { IconName } from "@/components/ui/icons";

export type NavItem = { href: string; label: string; icon: IconName; mobile?: boolean };

/** Order matches Dev Docs board 02. `mobile` items show in the bottom nav (as designed). */
export const NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "home", mobile: true },
  { href: "/check-in", label: "Check-in", icon: "sun" },
  { href: "/chat", label: "Chat", icon: "chat", mobile: true },
  { href: "/voice", label: "Voice", icon: "voice", mobile: true },
  { href: "/tools", label: "Tools", icon: "brain" },
  { href: "/discover", label: "Discover", icon: "sparkle" },
  { href: "/journal", label: "Journal", icon: "book" },
  { href: "/settings", label: "You", icon: "user", mobile: true },
];
