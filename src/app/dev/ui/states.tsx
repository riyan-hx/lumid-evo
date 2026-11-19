"use client";

import { EmptyState, ErrorCard, Skeleton } from "@/components/states/states";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";

export function StatesDemo() {
  const toast = useToast();
  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-title-m">Global states</h2>
      <Skeleton className="h-24 w-full" />
      <EmptyState title="Your first check-in will appear here." action="Check in" href="/check-in" />
      <ErrorCard message="That didn't save. Your words are still here." onRetry={() => {}} />
      <Pill label="Show toast" variant="glass" icon={null} height={44} onClick={() => toast.show("Saved to journal", () => {})} className="self-start" />
    </section>
  );
}
