"use client";

import Link from "next/link";
import { useOnline } from "@/lib/use-online";

/** Shown app-wide when offline (Dev Docs board 05 · 9.7). Calm tools and crisis support still work. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-forest px-4 py-2 type-label-s text-white">
      <span>Offline · here with you. Messages wait and send when you&apos;re back.</span>
      <Link href="/calm" className="text-lime underline">
        Calm tools
      </Link>
    </div>
  );
}
