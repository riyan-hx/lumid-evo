"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FigmaIcon } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { Pill } from "@/components/ui/pill";
import { useProfile } from "@/lib/profile";
import { clock, ordinal, windDowns, worries } from "@/lib/tool-store";

const ROW = "flex w-full items-center gap-3 rounded-[18px] border border-white bg-white/12 p-3 text-left";

function Row({ icon, title, note, done, href, onClick, expanded }: { icon: string; title: string; note: string; done?: boolean; href?: string; onClick?: () => void; expanded?: string }) {
  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-white/12">
        <FigmaIcon name={icon} size={19} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-label-m text-white">{title}</span>
        <span className="type-caption text-lime-soft">{expanded ?? note}</span>
      </span>
      {done && <FigmaIcon name="check-lime-20" size={20} />}
    </>
  );
  if (href) return <Link href={href} className={ROW}>{body}</Link>;
  return (
    <button type="button" onClick={onClick} aria-pressed={done} className={`${ROW} cursor-pointer`}>
      {body}
    </button>
  );
}

/** 6.6 · Wind down — Figma node 123:2443 */
export default function WindDown() {
  const router = useRouter();
  const toast = useToast();
  const { profile, update } = useProfile();
  const [state, setState] = useState<{ parked: number; until: string; streak: number; time: string } | null>(null);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    const parked = worries.all().filter((w) => w.parkedUntil && !w.doneAt && new Date(w.parkedUntil) > new Date());
    const until = parked[0]?.parkedUntil ? new Date(parked[0].parkedUntil) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of device storage
    setState({
      parked: parked.length,
      until: until ? `${clock(`${until.getHours()}:${until.getMinutes()}`)} ${until.getHours() >= 12 ? "PM" : "AM"}` : "",
      streak: windDowns.streak(),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    });
  }, []);

  if (!state) return <FigmaScreen mood="night">{null}</FigmaScreen>;
  return (
    <FigmaScreen gap={12} mood="night">
      <div className="flex w-full items-center gap-2.5">
        <button type="button" aria-label="Close" onClick={() => router.push("/calm")} className="flex size-11 cursor-pointer items-center justify-center rounded-[22px] border border-white bg-white/12 backdrop-blur-[12px]">
          <FigmaIcon name="close-white" size={20} />
        </button>
        <div className="flex flex-1 flex-col gap-px">
          <p className="type-label-m text-white">Wind down</p>
          <p className="type-caption text-lime">
            {state.time}
            {state.streak > 1 ? ` · ${ordinal(state.streak)} night in a row` : " · first night"}
          </p>
        </div>
      </div>
      <h1 className="type-flow-title text-white">Let the day go.</h1>
      <p className="type-body-m text-lime-soft">A short routine to help your mind switch off.</p>
      <Row icon="parking-lime-19" title="Park tomorrow's worries" note={state.parked ? `${state.parked} ${state.parked === 1 ? "worry" : "worries"} parked for ${state.until}` : "Write them down so your mind can rest"} done={state.parked > 0} href="/tools/worry" />
      <Row icon="eyeoff-lime-19" title="Screens dim, phone away" note="Discreet mode for the night" done={profile.discreet} onClick={() => update({ discreet: !profile.discreet })} />
      <Row icon="wind-lime-19" title="Slow breathing in bed" note="1 minute" href="/calm/breathe?bed=1" />
      <Row icon="moon-lime-19" title="Can't sleep after 20 minutes?" note="Get up, do something calm, come back" expanded={tip ? "Dim light, no screens — read or sit quietly, then go back to bed when sleepy." : undefined} onClick={() => setTip(!tip)} />
      <Grow />
      <div className="flex w-full items-center gap-2.5 rounded-[18px] bg-white/12 p-3.5">
        <FigmaIcon name="sparkle-lime-18" size={18} />
        <p className="flex-1 type-body-s text-lime-soft">{state.streak >= 3 ? "After nights like this, your mornings are calmer." : "Doing this at the same time each night helps your body learn when to sleep."}</p>
      </div>
      <Pill
        label="Goodnight"
        variant="lime"
        className="w-full"
        onClick={() => {
          windDowns.add();
          toast.show("Goodnight. Evo will be here in the morning.");
          router.push("/home");
        }}
      />
    </FigmaScreen>
  );
}
