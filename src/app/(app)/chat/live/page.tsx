"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MessageActions, type MessageAction, type Reaction } from "@/components/chat/message-actions";
import {
  BreathCard,
  ChatHeader,
  ChatSlider,
  ChipRow,
  Composer,
  EvidenceCard,
  EvoBubble,
  FairerCard,
  HelpOffer,
  ListeningPill,
  MeBubble,
  NightChips,
  OptionRows,
  ParkedCard,
  PhoneRow,
  RepairRows,
  SafetyCard,
  ScaleRow,
  StatusPill,
  TrapCard,
  Typing,
} from "@/components/chat/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { useToast } from "@/components/states/toast";
import { type Chat, type ChatMode, isLateNight, MODE_LABEL, type Part, useChats, withIds } from "@/lib/chat";
import { useCheckIns } from "@/lib/checkins";
import { CHIP_LINKS, type ChatEvent, helpOffer, opening, repairReply, type Reply, respond, simplify, suggestionReply } from "@/lib/evo-engine";
import { TONE_LABEL, useProfile } from "@/lib/profile";

const MODES: ChatMode[] = ["talk", "listen", "untangle", "calm", "night"];

function subtitle(c: Chat, tone: string) {
  if (c.mode === "night") return "Late-night mode · short & soft";
  if (c.mode === "listen") return "No advice unless you ask";
  if (c.mode === "untangle") return "Untangle a thought · CBT";
  if (c.mode === "calm") return "Calm me first";
  if (c.stage?.startsWith("safety")) return "Talk it through · slowing down";
  return `Talk it through · ${c.listening ? "listening" : tone}`;
}

function placeholder(c: Chat) {
  if (c.mode === "night") return "Whisper it here…";
  if (c.mode === "listen" || c.listening) return "Keep going…";
  if (c.stage === "ev-for" || c.stage === "ev-against") return "Add your own evidence…";
  if (c.stage === "edit-fairer") return "Write it your way…";
  const last = c.parts.at(-1);
  if (last?.t === "breath") return "Tell me when you're ready…";
  if (last?.t === "repair") return "Or tell me in your words…";
  if (last?.t === "options") return "Or say it in your words…";
  return "Say it your way…";
}

/** Marks the widget the user answered so it renders as answered on replay. */
function markEvent(parts: Part[], ev: ChatEvent): Part[] {
  if (ev.kind === "text") return parts;
  return parts.map((p) => {
    if (p.id !== ev.part.id) return p;
    if (ev.kind === "slider") return { ...p, value: ev.value, done: true } as Part;
    if (ev.kind === "breath") return { ...p, done: true } as Part;
    if (p.t === "scale") return { ...p, picked: Number(ev.value) };
    return { ...p, picked: ev.value } as Part;
  });
}

/** X3–X8, X12, X14 (+ 3.1 rows/scale, 3.2 listening) — one live conversation. */
function Live() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { ready, chats, start, update } = useChats();
  const { items, rerates } = useCheckIns();
  const { profile } = useProfile();
  const [chatId, setChatId] = useState<string | null>(params.get("id"));
  const [typing, setTyping] = useState(false);
  const [actions, setActions] = useState<{ part: Part & { t: "evo" }; top: number } | null>(null);
  const [menu, setMenu] = useState(false);
  const started = useRef(false);
  const chat = chats.find((c) => c.id === chatId);
  const dark = chat?.mode === "night";

  const apply = useCallback(
    (c: Chat, r: Reply, ev?: ChatEvent) => {
      const lead = r.parts.findIndex((p) => p.t !== "me");
      const now = lead === -1 ? r.parts : r.parts.slice(0, lead);
      const later = lead === -1 ? [] : r.parts.slice(lead);
      const short = c.simpler || profile.replyLength === "short";
      const shaped = later.map((p) => (p.t === "evo" && c.simpler ? { ...p, text: simplify(p.text) } : p));
      update(c.id, (ch) => ({ ...ch, ...r.patch, parts: [...(ev ? markEvent(ch.parts, ev) : ch.parts), ...withIds(now)] }));
      if (!shaped.length) return;
      setTyping(true);
      const len = shaped.reduce((n, p) => n + (p.t === "evo" ? p.text.length : 40), 0);
      setTimeout(
        () => {
          update(c.id, (ch) => ({ ...ch, parts: [...ch.parts, ...withIds(shaped)] }));
          setTyping(false);
        },
        Math.min(short ? 900 : 1300, 450 + len * 8),
      );
    },
    [update, profile.replyLength],
  );

  // Start a chat once the store is ready (or open an existing one).
  useEffect(() => {
    if (!ready || started.current || (chatId && chats.some((c) => c.id === chatId))) return;
    started.current = true;
    const asked = params.get("mode") as ChatMode | null;
    const mode: ChatMode = isLateNight() && asked !== "calm" ? "night" : asked && MODES.includes(asked) ? asked : profile.chatTone === "listen" ? "listen" : "talk";
    const latest = items[0];
    const fresh = latest && Date.now() - new Date(latest.at).getTime() < 12 * 36e5;
    const checkin = params.get("from") === "checkin" && fresh ? { word: latest.word || latest.feeling, intensity: latest.intensity, causes: latest.causes ?? [] } : undefined;
    const c = start(mode, opening(mode, { now: new Date(), checkin }));
    if (params.get("voice")) update(c.id, (ch) => ({ ...ch, voice: true, language: params.get("lang") ?? undefined }));
    setChatId(c.id);
    router.replace(`/chat/live?id=${c.id}`, { scroll: false });
    const q = params.get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time: the first message typed on X1 / spoken on 3.3
    if (q) apply(c, respond(c, { kind: "text", text: q }));
  }, [ready, chatId, chats, params, items, start, update, router, apply, profile.chatTone]);

  const count = chat?.parts.length ?? 0;
  useEffect(() => {
    if (count) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [count, typing]);

  if (!chat) return <FigmaScreen gap={12}>{null}</FigmaScreen>;

  const act = (ev: ChatEvent) => apply(chat, respond(chat, ev), ev);
  const go = (label: string) => {
    const href = CHIP_LINKS[label];
    if (!href) return false;
    if (href.startsWith("tel:")) window.location.assign(href);
    else router.push(href.replace("{id}", chat.id));
    return true;
  };
  const pick = (part: Part, value: string) => {
    if (go(value)) return update(chat.id, (ch) => ({ ...ch, parts: markEvent(ch.parts, { kind: "pick", part, value }) }));
    act({ kind: "pick", part, value });
  };
  const lastBreath = rerates.find((r) => r.tool === "breathe");
  const meCount = chat.parts.filter((p) => p.t === "me").length;

  function onAction(a: MessageAction) {
    if (!actions || !chat) return;
    const { text } = actions.part;
    setActions(null);
    if (a === "insight") {
      update(chat.id, (ch) => ({ ...ch, insights: [...new Set([...ch.insights, text])] }));
      toast.show("Saved to your library");
    } else if (a === "simpler") apply(chat, { parts: [{ t: "evo", text: simplify(text) }] });
    else if (a === "malayalam") toast.show("Malayalam replies arrive with the language pack");
    else if (a === "aloud") {
      if (!("speechSynthesis" in window)) return toast.show("Reading aloud isn't supported on this device");
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } else apply(chat, repairReply());
  }

  function react(r: Reaction) {
    if (!actions || !chat) return;
    const id = actions.part.id;
    update(chat.id, (ch) => ({ ...ch, reactions: { ...ch.reactions, [id]: r } }));
  }

  return (
    <FigmaScreen gap={12} mood={dark ? "latenight" : chat.mode === "calm" || chat.listening ? "calm" : chat.stage?.startsWith("safety") ? "warm" : "day"}>
      <ChatHeader title={chat.mode === "listen" ? "Just listening" : "Evo"} sub={subtitle(chat, TONE_LABEL[profile.chatTone])} dark={dark} onBack={() => router.push("/chat")} onMore={() => setMenu(true)} />
      {chat.mode === "listen" && <ListeningPill />}
      {dark && (
        <div className="flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- Figma icon */}
          <img src="/figma/icons/moon-lime-14.svg" alt="" width={14} height={14} />
          <p className="type-caption text-white/80">Dimmer · fewer questions · no long reads</p>
        </div>
      )}

      <div role="log" aria-live="polite" aria-label="Conversation" className="flex w-full flex-col gap-3">
        {chat.parts.map((p) => (
          <div key={p.id} className="evo-msg flex w-full flex-col">
            {p.t === "evo" && (
              <EvoBubble dark={dark} onLongPress={(rect) => setActions({ part: p, top: rect.top })}>
                {p.text}
              </EvoBubble>
            )}
            {p.t === "me" && <MeBubble dark={dark}>{p.text}</MeBubble>}
            {p.t === "chips" && <ChipRow options={p.options} picked={p.picked} indent={p.indent} onPick={(v) => pick(p, v)} />}
            {p.t === "options" && <OptionRows options={p.options} picked={p.picked} onPick={(v) => pick(p, v)} />}
            {p.t === "scale" && <ScaleRow label={p.label} picked={p.picked} onPick={(n) => pick(p, String(n))} />}
            {p.t === "slider" && <ChatSlider label={p.label} value={p.value} done={p.done} onCommit={(v) => act({ kind: "slider", part: p, value: v })} />}
            {p.t === "breath" && <BreathCard done={p.done} last={lastBreath ? `Last time: ${lastBreath.measure.toLowerCase()} ${lastBreath.before} → ${lastBreath.after} in 1 min` : undefined} onDone={(skipped) => act({ kind: "breath", part: p, skipped })} />}
            {p.t === "trap" && <TrapCard name={p.name} note={p.note} also={p.also} />}
            {p.t === "evidence" && <EvidenceCard supports={p.supports} against={p.against} />}
            {p.t === "fairer" && (
              <div className="flex w-full flex-col gap-3">
                <FairerCard
                  text={p.text}
                  thought={p.thought}
                  before={p.before}
                  after={p.after}
                  locked={!!p.picked}
                  onRate={(n) => update(chat.id, (ch) => ({ ...ch, belief: [p.before, n], parts: ch.parts.map((x) => (x.id === p.id ? { ...x, after: n } : x)) }))}
                />
                <ChipRow options={["That fits", "Edit the words", "Not yet"]} picked={p.picked} onPick={(v) => pick(p, v)} />
              </div>
            )}
            {p.t === "safety" && <SafetyCard quote={p.quote} picked={p.picked} onPick={(v) => pick(p, v)} />}
            {p.t === "phone" && <PhoneRow />}
            {p.t === "parked" && <ParkedCard what={p.what} when={p.when} />}
            {p.t === "status" && <StatusPill text={p.text} />}
            {p.t === "repair" && <RepairRows picked={p.picked} onPick={(v) => pick(p, v)} />}
            {p.t === "nightChips" && <NightChips picked={p.picked} onPick={(v) => pick(p, v)} />}
          </div>
        ))}
        {typing && <Typing dark={dark} />}
      </div>

      <Grow />
      {chat.mode === "listen" && !chat.suggest && meCount >= 2 && !typing && <HelpOffer onClick={() => apply(chat, helpOffer())} />}
      {chat.suggest && !typing && (
        <ChipRow
          options={chat.suggest}
          onPick={(v) => {
            if (go(v)) return;
            apply(chat, { ...suggestionReply(chat, v), patch: { ...suggestionReply(chat, v).patch, suggest: undefined } });
          }}
        />
      )}
      <Composer dark={dark} placeholder={placeholder(chat)} onPlus={() => router.push("/chat/style")} onSend={(text) => !typing && act({ kind: "text", text })} />

      {actions && <MessageActions text={actions.part.text} top={actions.top} reaction={chat.reactions?.[actions.part.id]} onReact={react} onAction={onAction} onClose={() => setActions(null)} />}
      {menu && (
        <div role="dialog" aria-modal="true" aria-label="Chat options" className="fixed inset-0 z-50">
          <button type="button" aria-label="Close" onClick={() => setMenu(false)} className="absolute inset-0 cursor-default bg-[rgba(21,26,19,0.28)] evo-enter-fade" />
          <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[430px] flex-col gap-0.5 rounded-t-[28px] bg-surface p-2.5 pb-7 evo-enter-fade">
            {[
              { label: "Wrap up this chat", run: () => router.push(`/chat/summary?id=${chat.id}`) },
              { label: "How Evo talks to you", run: () => router.push("/chat/style") },
              { label: chat.listening ? "Ask questions again" : "Just listen for a while", run: () => update(chat.id, (ch) => ({ ...ch, listening: !ch.listening })) },
              { label: "Talk to a person now", run: () => window.location.assign("tel:14416") },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => {
                  setMenu(false);
                  o.run();
                }}
                className="w-full cursor-pointer rounded-[16px] px-3.5 py-3.5 text-left type-label-m text-t1 hover:bg-subtle"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <span className="sr-only">{MODE_LABEL[chat.mode]}</span>
    </FigmaScreen>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Live />
    </Suspense>
  );
}
