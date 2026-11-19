"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OHeader } from "@/components/discover/parts";
import { FigmaIcon, Tile } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Message } from "@/components/ui/message";
import { Pill } from "@/components/ui/pill";
import { trusted } from "@/lib/safety";
import { loadRecords } from "@/lib/thoughts";
import { mmss, useRecorder } from "@/lib/use-recorder";

const FIELD = "w-full resize-none [field-sizing:content] bg-transparent outline-none placeholder:text-t3";

/** O3 · The friend's chair — Figma node 146:4555. Same words, said to a friend; the kinder voice is yours too. */
export default function FriendsChair() {
  const router = useRouter();
  const r = useRecorder();
  const audio = useRef<HTMLAudioElement>(null);
  const [said, setSaid] = useState("");
  const [friend, setFriend] = useState("");
  const [reply, setReply] = useState("");
  const [swapped, setSwapped] = useState(false);
  useEffect(() => {
    const hot = loadRecords()[0]?.hot;
    if (hot) setSaid(hot); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of device storage
    setFriend(trusted.get()?.name ?? "");
  }, []);

  const who = friend.trim() || "a friend";
  const done = reply.trim() || r.url;
  return (
    <FigmaScreen gap={12} mood="warm">
      <OHeader icon="close" label="Close" title="The friend's chair" sub="Swap seats for a minute" onClick={() => router.back()} />
      <h1 className="type-flow-title text-forest">If {who} said this to you, what would you tell {friend.trim() ? friend.trim() : "them"}?</h1>
      <div className="flex w-full flex-col gap-1.5 rounded-[22px] border border-white bg-white/85 p-4">
        <span className="flex items-center gap-2">
          <FigmaIcon name="quote-peach-16" size={16} />
          <span className="type-label-s text-peach-text">WHAT YOU SAID TO YOURSELF</span>
        </span>
        <textarea aria-label="What you said to yourself" rows={2} value={said} onChange={(e) => setSaid(e.target.value)} placeholder="The harsh thing you've been telling yourself" className={`${FIELD} type-title-l text-t1`} />
      </div>
      <div className="flex w-full items-center justify-center gap-2.5">
        <span className="flex flex-col items-center gap-1">
          <Tile size={52} radius={17} bg="bg-peach-soft">
            <FigmaIcon name="user-peach-27" size={27} />
          </Tile>
          <span className="type-caption text-t2">You</span>
        </span>
        <button type="button" aria-label="Swap seats" onClick={() => setSwapped(true)} className={`flex size-9 cursor-pointer items-center justify-center rounded-[12px] bg-surface transition-transform duration-500 ${swapped ? "rotate-180" : ""}`}>
          <FigmaIcon name="refresh-t2-19" size={19} />
        </button>
        <span className="flex flex-col items-center gap-1">
          <Tile size={52} radius={17} bg="bg-lavender-soft">
            <FigmaIcon name="users-lav-27" size={27} />
          </Tile>
          <input aria-label="Friend's name" value={friend} onChange={(e) => setFriend(e.target.value)} placeholder="Friend" className="w-20 bg-transparent text-center type-caption text-t2 outline-none placeholder:text-t3" />
        </span>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-[22px] bg-lavender-soft p-4">
        <p className="type-label-s text-lavender-text">WHAT YOU&apos;D TELL {(friend.trim() || "THEM").toUpperCase()}</p>
        <textarea aria-label={`What you'd tell ${who}`} rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Say it the way you'd say it to them…" className={`${FIELD} type-body-m text-t1`} />
        <button type="button" onClick={r.state === "recording" ? r.stop : r.start} className="flex cursor-pointer items-center gap-1.5 self-start">
          <FigmaIcon name="voice-lav-14" size={14} />
          <span className="type-caption text-lavender-text">
            {r.state === "recording" ? `Recording… ${mmss(r.seconds)} · tap to stop` : r.url ? `Said by voice · ${mmss(r.seconds)}` : r.state === "denied" ? "Mic is off — typing works too" : "Or say it out loud"}
          </span>
        </button>
      </div>
      {done && <Message role="evo">Notice the difference? That kinder voice is yours too.</Message>}
      <audio ref={audio} src={r.url ?? undefined} hidden />
      <Grow />
      <Pill
        label={r.url ? "Hear it back in my voice" : "Hear it back"}
        className="w-full"
        disabled={!done}
        onClick={() => {
          if (r.url) return void audio.current?.play();
          if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
        }}
      />
    </FigmaScreen>
  );
}
