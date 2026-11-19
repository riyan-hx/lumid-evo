import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { SideNav } from "./nav";

/**
 * Web shell. Phones: the Figma screen edge-to-edge + the DS Bottom Nav.
 * Tablet/desktop: side navigation + the same screen centred (Dev Docs board 02).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <SideNav />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
