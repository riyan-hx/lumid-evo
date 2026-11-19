import type { ReactNode } from "react";
import { BottomNav, CrisisLink, SideNav } from "./nav";

/**
 * Web shell (Dev Docs board 02).
 * Mobile: single column + bottom nav. Tablet: icon rail. Desktop: sidebar | main 720 | context panel 360.
 */
export function AppShell({ children, panel }: { children: ReactNode; panel?: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 justify-center gap-8 px-4 pt-6 pb-28 md:px-8 md:pb-10">
        <main id="main" className="w-full max-w-[480px] md:max-w-[640px] desk:max-w-[720px]">
          <div className="mb-4 flex justify-end md:hidden">
            <CrisisLink compact />
          </div>
          {children}
        </main>
        {panel && <aside className="sticky top-6 hidden h-fit w-[360px] shrink-0 flex-col gap-4 desk:flex">{panel}</aside>}
      </div>
      <BottomNav />
    </div>
  );
}
