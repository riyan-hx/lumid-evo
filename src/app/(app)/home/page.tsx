"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { FigmaScreen } from "@/components/figma/screen";
import { RoughDay } from "@/components/safety/rough-day";
import { SoftChip } from "@/components/ui/controls";
import { Orb } from "@/components/ui/orb";
import { useCheckIns } from "@/lib/checkins";
import { checkinHref, twoWeeksLow } from "@/lib/checkin-route";
import { useProfile } from "@/lib/profile";
import { safety } from "@/lib/safety";
import { circle, homework } from "@/lib/circle";

const part = (h: number) => (h < 12 ? "morning" : h < 17 ? "afternoon" : "evening");

/** 2.1 · Home — Figma node 114:1496 */
export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const { items } = useCheckIns();
  const [hideAsk, setHideAsk] = useState(false);
  const [text, setText] = useState("");
  const [rough, setRough] = useState<boolean | null>(null);
  const [fromPsy, setFromPsy] = useState<string | null>(null);
  useEffect(() => {
    if (safety.needsReturn()) return router.replace("/safety/return");
    setRough(safety.isPaused()); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    const open = homework.all().filter((h) => !h.done).length;
    const who = circle.get()?.clinician.short;
    if (who && open) setFromPsy(`${open} ${open === 1 ? "thing" : "things"} from ${who} this week`);
  }, [router]);
  const now = new Date();
  const p = part(now.getHours());
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" }).format(now).replace(" ", ", ");
  const time = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(now).toUpperCase();
  const last = items[0];
  if (rough === null) return <FigmaScreen>{null}</FigmaScreen>;
  if (rough) return <RoughDay />;

  // Brief lines come from the person's own data (insights engine later); never invented facts.
  const lines = [
    last ? { icon: "moon-lav-14", bg: "bg-lavender-soft", text: `Last check-in: ${last.feeling.toLowerCase()}${last.word ? `, ${last.word}` : ""}`, href: "/journal" } : null,
    twoWeeksLow(items) ? { icon: "clock-peach-14", bg: "bg-peach-soft", text: "Two heavy weeks — a 1-minute check might help", href: "/check-in/two-week" } : { icon: "clock-peach-14", bg: "bg-peach-soft", text: items.length >= 10 ? "Evo is learning when your days feel hardest" : "A quick check-in helps Evo learn your patterns", href: items.length >= 10 ? "/insights" : undefined },
    fromPsy ? { icon: "heart-limedeep-14", bg: "bg-lime-soft", text: fromPsy, href: "/plan" } : { icon: "heart-limedeep-14", bg: "bg-lime-soft", text: "Showing up for yourself counts" },
  ].filter(Boolean) as { icon: string; bg: string; text: string; href?: string }[];

  return (
    <FigmaScreen gap={14} className="pb-[110px]">
      <div className="flex w-full items-center">
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="type-caption text-t3">{date}</p>
          <h1 className="text-[26px] leading-[1.1] font-medium tracking-[-0.65px] text-forest">
            Good {p}
            {profile.name ? `, ${profile.name}` : ""}
          </h1>
        </div>
        <Link
          href="/reminders"
          aria-label="Reminders and notifications"
          className="flex size-11 items-center justify-center rounded-[22px] border border-white bg-white/78 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]"
        >
          <FigmaIcon name="bell" size={20} />
        </Link>
      </div>

      <div
        className="flex w-full flex-col gap-3 rounded-[28px] border border-white p-[18px] shadow-[0_18px_40px_-12px_rgba(21,26,19,0.18)]"
        style={{ backgroundImage: "linear-gradient(135.08deg, rgb(221,245,204) 14.286%, rgb(243,251,236) 50%, rgb(255,244,228) 85.714%)" }}
      >
        <div className="flex items-center gap-2.5">
          <Orb size={40} />
          <div className="flex flex-col">
            <p className="type-label-m text-t1">Your {p} brief</p>
            <p className="type-caption text-t3">from Evo · {time}</p>
          </div>
        </div>
        <p className="text-[22px] leading-[28px] font-medium tracking-[-0.088px] text-forest">
          {p === "evening" ? "Tonight might feel heavy — want to check in before it builds?" : `How is your ${p} going? A ten-second check-in helps.`}
        </p>
        {lines.map((l) => (
          <div key={l.text} className="flex items-center gap-2.5">
            <Tile size={26} radius={9} bg={l.bg}>
              <FigmaIcon name={l.icon} size={14} />
            </Tile>
            {l.href ? (
              <Link href={l.href} className="flex-1 type-body-s text-t2">
                {l.text}
              </Link>
            ) : (
              <p className="flex-1 type-body-s text-t2">{l.text}</p>
            )}
          </div>
        ))}
        {!hideAsk && (
          <div className="flex gap-2">
            <SoftChip label="Check in" selected onClick={() => router.push(checkinHref(profile.checkinStyle, items))} />
            <SoftChip label="Not now" onClick={() => setHideAsk(true)} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/chat?text=${encodeURIComponent(text)}`);
        }}
        className="flex w-full items-center gap-1.5 rounded-[30px] border border-lime bg-surface py-1.5 pr-1.5 pl-[18px] shadow-[0_12px_28px_-10px_rgba(21,26,19,0.22)]"
      >
        <label htmlFor="ask" className="sr-only">
          Tell Evo what&apos;s on your mind
        </label>
        <input
          id="ask"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell Evo what's on your mind…"
          className="min-w-0 flex-1 bg-transparent type-body-m text-t1 outline-none placeholder:text-t3"
        />
        <Link href="/voice" aria-label="Speak instead" className="flex size-11 items-center justify-center rounded-[22px] bg-subtle">
          <FigmaIcon name="mic-20" size={20} />
        </Link>
        <button type="submit" aria-label="Send" className="flex size-12 cursor-pointer items-center justify-center rounded-[24px]" style={{ backgroundImage: "linear-gradient(135deg, rgb(51,65,46) 0%, rgb(21,26,19) 71.429%)" }}>
          <FigmaIcon name="send-white" size={20} />
        </button>
      </form>

      <div className="flex w-full items-center">
        <h2 className="flex-1 type-title-m text-ink">Tools for tonight</h2>
        <Link href="/discover" className="type-label-m text-lime-deep">
          Discover
        </Link>
      </div>
      <div className="flex w-full gap-2.5">
        {[
          { icon: "brain-lav-18", bg: "bg-lavender-soft", title: "Untangle a thought", note: "CBT · 5 min", href: "/tools" },
          { icon: "wind-sky-18", bg: "bg-sky-soft", title: "Breathe it down", note: "1 min", href: "/calm" },
        ].map((t) => (
          <Link key={t.title} href={t.href} className="flex flex-1 flex-col items-start gap-2 rounded-[20px] border border-white bg-white/78 p-3.5 shadow-[0_10px_26px_rgba(21,26,19,0.07)] backdrop-blur-[12px]">
            <Tile size={34} radius={11} bg={t.bg}>
              <FigmaIcon name={t.icon} size={18} />
            </Tile>
            <p className="type-label-m text-t1">{t.title}</p>
            <p className="type-caption text-t3">{t.note}</p>
          </Link>
        ))}
      </div>
    </FigmaScreen>
  );
}
