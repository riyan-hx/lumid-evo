"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/controls";
import { Icon, type IconName } from "@/components/ui/icons";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";

const HELPS: { icon: IconName; bg: string; color: string; title: string; note: string; href: string }[] = [
  { icon: "brain", bg: "bg-lavender-soft", color: "text-lavender-text", title: "Untangle a thought", note: "A guided CBT thought record", href: "/tools" },
  { icon: "wind", bg: "bg-mint-soft", color: "text-mint-text", title: "Calm your body", note: "Breathing and grounding, 1–3 min", href: "/calm" },
  { icon: "path", bg: "bg-sun-soft", color: "text-sun-text", title: "Take one small step", note: "When everything feels too big", href: "/ladder" },
];

/** 1.9 · First day */
export default function FirstDay() {
  const { profile, update } = useProfile();
  useEffect(() => {
    if (!profile.onboarded) update({ onboarded: true });
  }, [profile.onboarded, update]);
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(new Date());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="type-label-s text-t3">{today}</p>
        <h1 className="type-screen-title text-forest">Hi{profile.name ? `, ${profile.name}` : ""}, glad you&apos;re here</h1>
      </div>
      <div className="flex flex-col gap-4 rounded-[28px] bg-(image:--gradient-forest) p-5 text-white">
        <div className="flex items-center gap-3">
          <Orb size={44} />
          <div>
            <p className="type-label-s text-lime">EVO</p>
            <p className="type-body-s text-white/70">Your first check-in · 10 seconds</p>
          </div>
        </div>
        <p className="type-title-m">How are you feeling right now? Three taps, no typing.</p>
        <Pill label="Check in now" variant="lime" href="/check-in" className="self-start" height={48} />
      </div>
      <section className="flex flex-col gap-2.5">
        <h2 className="type-title-m">What Evo can help with</h2>
        {HELPS.map((h) => (
          <Link key={h.title} href={h.href}>
            <Card className="flex-row items-center gap-3">
              <IconTile icon={h.icon} bg={h.bg} color={h.color} />
              <div className="flex-1">
                <p className="type-label-m">{h.title}</p>
                <p className="type-body-s text-t3">{h.note}</p>
              </div>
              <Icon name="chevron-right" size={18} className="text-t3" />
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
