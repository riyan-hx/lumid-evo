import type { Chat, ChatMode, Part, PartBody } from "./chat";
import { HEAVY } from "./safety";

/**
 * Evo's on-device conversation engine. Deterministic and rule-based so it works offline and every
 * branch is reviewable; the server model (build step 15) replaces `reflect` but keeps these rules:
 * safety first, body before thoughts, ask before pointing out a trap, never advise in listening mode.
 */

type NewPart = PartBody;
export type Reply = { parts: NewPart[]; patch?: Partial<Chat> };
export type ChatEvent = { kind: "text"; text: string } | { kind: "pick"; part: Part; value: string } | { kind: "breath"; part: Part; skipped: boolean } | { kind: "slider"; part: Part; value: number };

/** Chips that leave the chat. The page resolves {id}. */
export const CHIP_LINKS: Record<string, string> = {
  "Open my safety plan": "/safety",
  "Show me support now": "/crisis",
  "Message someone I trust": "/safety/reach-out",
  "Call Tele-MANAS 14416": "tel:14416",
  "Pick a small step": "/chat/step?id={id}",
  "Wrap up": "/chat/summary?id={id}",
  "Sleep sounds": "/calm?tool=sleep",
  "Body scan · 5 min": "/calm?tool=body-scan",
  "Try grounding": "/calm?tool=ground",
};

const RISK = /(what'?s the point|no point (in )?(living|anything)|kill (myself|me)|end (it|my life|things)|suicid|self[- ]?harm|hurt(ing)? myself|not (want|wanting) to (be here|live|wake up)|better off without me|can'?t go on|want to die)/i;
const BODY = /(chest (is |feels )?tight|can'?t breathe|panic|heart (is )?(racing|pounding)|shaking|can'?t think( straight)?|dizzy|hyperventilat)/i;
const REPAIR = /(that'?s not it|not helpful|you don'?t get it|stop fixing|don'?t need fixing|that'?s wrong|not what i meant)/i;
const ADVICE = /(i want advice|what should i do|any (advice|tips)|how do i (fix|stop|deal))/i;

type Trap = { name: string; note: string; re: RegExp };
const TRAPS: Trap[] = [
  { name: "Mind reading", note: "Guessing what others think without checking. Your brain does this more when you're hurt.", re: /\b(thinks?|believes?) (i'?m|i am|that i|i'?ve)\b|\b(they|everyone|people)('re| are) (judging|laughing)/i },
  { name: "Catastrophising", note: "Jumping straight to the worst outcome, as if it's already happened.", re: /\b(ruined|disaster|worst|going to fail|never recover|end of the world|everything is over)\b/i },
  { name: "Should statements", note: "Rigid rules about how you must be — they tend to turn into guilt.", re: /\bi (should|must|have to)\b/i },
  { name: "All-or-nothing", note: "Seeing it in extremes, with no middle ground.", re: /\b(everyone|everybody|nobody|no one|always|never|nothing|everything)\b/i },
  { name: "Labelling", note: "Turning one hard moment into a verdict about who you are.", re: /\bi'?m (so |such an? |just )?(useless|stupid|a failure|worthless|pathetic|an idiot|hopeless|a burden|a mess)\b/i },
];

export function findTraps(text: string) {
  const hits = TRAPS.map((t) => ({ t, m: text.match(t.re) })).filter((x) => x.m);
  if (!hits.length) return null;
  const [main, second] = hits;
  return {
    name: main.t.name,
    note: main.t.note,
    also: second ? `Also: ${second.t.name.toLowerCase()} — "${second.m![0].toLowerCase()}"` : undefined,
  };
}

const FEEL_SETS: [RegExp, string[]][] = [
  [/(ignored|passed over|unheard|skipped|talked over|interrupted|no one listen)/i, ["Embarrassed", "Angry", "Useless", "Invisible"]],
  [/(fight|fought|argu|shouted|yelled)/i, ["Hurt", "Angry", "Guilty", "Misunderstood"]],
  [/(tired|exhausted|drained|burn(ed|t) out)/i, ["Drained", "Numb", "Overwhelmed", "Flat"]],
  [/(anxious|worr|nervous|scared|exam|tomorrow)/i, ["Anxious", "On edge", "Scared", "Overwhelmed"]],
  [/(lonely|alone|left out|no friends)/i, ["Lonely", "Left out", "Sad", "Unseen"]],
  [/(compar|not good enough|jealous)/i, ["Not enough", "Jealous", "Hurt", "Small"]],
];

export function feelingChips(text: string) {
  const set = FEEL_SETS.find(([re]) => re.test(text))?.[1] ?? ["Sad", "Anxious", "Angry", "Tired"];
  const own = text.match(/\bi feel (?:so |really |very )?([a-z]+)/i)?.[1];
  const word = own ? own[0].toUpperCase() + own.slice(1).toLowerCase() : null;
  return word && !set.includes(word) ? [...set.slice(0, 3), word] : set;
}

function opener(text: string) {
  if (/(ignored|passed over|unheard|skipped|talked over)/i.test(text)) return "That stings — being passed over in front of everyone.";
  if (/(fight|fought|argu)/i.test(text)) return "That sounds painful — fights with people close to us cut deep.";
  if (/(exam|test|result)/i.test(text)) return "Exams can make everything feel like it's riding on one moment.";
  if (/(lonely|alone)/i.test(text)) return "Feeling alone with it makes everything heavier.";
  const own = text.match(/\bi feel (?:so |really |very )?([a-z]+)/i)?.[1];
  return own ? `Feeling ${own.toLowerCase()} is a lot to carry.` : "Thank you for telling me. That sounds hard.";
}

export function topicOf(text: string) {
  const fight = text.match(/(?:fight|argument|argued|fought) with (?:my )?(\w+)/i);
  if (fight) return `fight with ${fight[1]}`;
  const thing = text.match(/\b(manager|boss|meeting|exam|college|school|money|sleep|partner|work|job|family|friends?)\b/i)?.[1]?.toLowerCase();
  if (thing) return ["meeting", "exam"].includes(thing) ? `the ${thing}` : thing;
  return text.split(/\s+/).slice(0, 4).join(" ").replace(/[.,!?]+$/, "").toLowerCase();
}

const LISTEN_LINES = ["Mm. I'm here — keep going whenever you're ready.", "That makes sense. What happened next?", "I'm listening. Take your time."];

function listenReflect(text: string, n: number): NewPart[] {
  const own = text.match(/\bi feel (?:so |really |very )?([a-z]+)/i)?.[1];
  const line = own ? `It sounds like you felt ${own.toLowerCase()} — and that matters.` : n === 0 ? "I'm here. Say as much or as little as you want." : LISTEN_LINES[n % LISTEN_LINES.length];
  return [{ t: "evo", text: line }, { t: "chips", options: ["Yes, exactly", "Not quite"], indent: true }];
}

const FOLLOW_UPS = ["What do you think is underneath it?", "What would you say to a friend in the same spot?", "What do you need most right now?"];

const night = (c: Chat) => c.mode === "night";
const evoCount = (c: Chat) => c.parts.filter((p) => p.t === "evo").length;
const meCount = (c: Chat) => c.parts.filter((p) => p.t === "me").length;

/** Opening parts for a new chat. */
export function opening(mode: ChatMode, ctx: { now: Date; checkin?: { word: string; intensity: number; causes: string[] } }): NewPart[] {
  const when = ctx.now.getHours() >= 18 ? "tonight" : "today";
  if (mode === "calm") return [{ t: "evo", text: "Let's slow your body first — one minute, right here. We'll talk after." }, { t: "breath" }];
  if (mode === "night") {
    const hm = ctx.now.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
    return [{ t: "evo", text: `It's ${hm}. I'll keep this short and soft.` }];
  }
  if (mode === "listen") return [{ t: "evo", text: "I'm here. Say as much or as little as you want." }];
  if (mode === "untangle") return [{ t: "evo", text: "Let's untangle it together. What's the thought that keeps coming back?" }];
  if (ctx.checkin) {
    const { word, intensity, causes } = ctx.checkin;
    const options = [...causes.slice(0, 1).map((c) => `Something with ${c.toLowerCase()}`), "I can't stop overthinking", "I don't know — I just feel heavy"];
    return [{ t: "evo", text: `${word[0].toUpperCase() + word.slice(1)} at ${intensity} ${when}. What's been happening?` }, { t: "options", options }];
  }
  return [{ t: "evo", text: `What's on your mind ${when}?` }];
}

/** Evo's response to one user event. */
export function respond(chat: Chat, ev: ChatEvent): Reply {
  if (ev.kind === "text") return onText(chat, ev.text.trim());
  if (ev.kind === "slider") {
    const p = ev.part as Extract<Part, { t: "slider" }>;
    const line = chat.mode === "untangle" || chat.thought ? `Thanks. When you feel ${p.word.toLowerCase()}, what's the thought that shows up?` : `${p.word} at ${ev.value} — that's real. What part of it hurts most?`;
    return {
      parts: [{ t: "evo", text: line }],
      patch: { feelings: [...chat.feelings.filter((f) => f.name !== p.word), { name: p.word, start: ev.value }], suggest: ["Tell me more", "I want advice"] },
    };
  }
  if (ev.kind === "breath") {
    return {
      parts: [{ t: "evo", text: ev.skipped ? "Okay — we'll keep talking. Tell me when you're ready." : "Well done. How does your body feel now?" }, ...(ev.skipped ? [] : [{ t: "chips", options: ["Calmer", "About the same", "Still racing"], indent: true } as NewPart])],
    };
  }
  return onPick(chat, ev.part, ev.value);
}

function onText(chat: Chat, text: string): Reply {
  const me: NewPart = { t: "me", text };
  const first = meCount(chat) === 0;
  const patch: Partial<Chat> = { suggest: undefined, ...(first && !chat.topic ? { topic: topicOf(text) } : {}) };

  if (RISK.test(text)) {
    const quote = text.match(RISK)![0].toLowerCase();
    return {
      parts: [me, { t: "evo", text: "I'm really glad you said that to me. I want to make sure I understand." }, { t: "safety", quote }, { t: "phone" }],
      patch: { ...patch, stage: "safety" },
    };
  }
  if (HEAVY.test(text)) return { parts: [me, { t: "softcheck" }], patch: { ...patch, stage: "safety-soft" } };
  if (REPAIR.test(text)) return { parts: [me, ...repair()], patch: { ...patch, stage: undefined } };

  if (chat.stage === "ev-for") return { parts: [me, { t: "evo", text: "And what doesn't fit it? Anything at all — even small things." }], patch: { ...patch, stage: "ev-against", evidenceFor: text } };
  if (chat.stage === "ev-against") return evidence(chat, text, me, patch);
  if (chat.stage === "edit-fairer") {
    return { parts: [me, { t: "evo", text: "That's yours now — and it's fairer. How much do you believe the old thought?" }, { t: "fairer", text, thought: chat.thought ?? "", before: chat.belief?.[0] ?? 80 }], patch: { ...patch, stage: undefined, fairer: text } };
  }

  if (night(chat)) {
    if (/(sleep|replay|worr|over and over|keep thinking|awake)/i.test(text) || first) {
      return {
        parts: [me, { t: "evo", text: "Night makes worries louder. Let's park it — I'll hold it until tomorrow." }, { t: "parked", what: topicOf(text.replace(/\b(can'?t|cannot|couldn'?t) sleep\b|\bsleep\b/gi, "")), when: "Worry time · tomorrow 10:00" }, { t: "nightChips" }],
        patch: { ...patch, topic: chat.topic || topicOf(text) },
      };
    }
    return { parts: [me, { t: "evo", text: "I hear you. Rest is the kindest next step — want something soft to help?" }, { t: "nightChips" }], patch };
  }

  if (BODY.test(text) && chat.parts.some((p) => p.t === "breath" && !p.done)) return { parts: [me, { t: "evo", text: "I'm right here. Let's finish this minute together — just follow the circle." }], patch };
  if (BODY.test(text)) return { parts: [me, { t: "evo", text: "Let's slow your body first — one minute, right here. We'll talk after." }, { t: "breath" }], patch };

  if (chat.listening) return { parts: [me, ...listenReflect(text, evoCount(chat))], patch };

  if (ADVICE.test(text)) {
    return {
      parts: [me, { t: "evo", text: "One idea: pick the smallest thing that would make tomorrow a little easier — a message, a note, a walk. Want to choose one together?" }, { t: "chips", options: ["Pick a small step", "Not yet"], indent: true }],
      patch,
    };
  }

  const trap = findTraps(text);
  if (trap && (chat.mode === "untangle" || chat.feelings.length > 0)) {
    return {
      parts: [me, { t: "evo", text: "Can I point something out, gently?" }, { t: "trap", ...trap }, { t: "evo", text: "Want to check what the evidence actually says?" }, { t: "chips", options: ["Check the evidence", "That's not it", "Not now"], indent: true }],
      patch: { ...patch, thought: text.replace(/[.!]+$/, "") },
    };
  }

  if (first || chat.feelings.length === 0) {
    return { parts: [me, { t: "evo", text: `${opener(text)} Which word is closest?` }, { t: "chips", options: feelingChips(text), indent: true }], patch };
  }

  return { parts: [me, { t: "evo", text: FOLLOW_UPS[evoCount(chat) % FOLLOW_UPS.length] }], patch: { ...patch, suggest: ["Tell me more", "I want advice"] } };
}

/** X7 · "This isn't right for me". */
export function repairReply(): Reply {
  return { parts: [{ t: "me", text: "This isn't right for me." }, ...repair()] };
}

/** 3.2 · the help offer in listening mode. */
export function helpOffer(): Reply {
  return { parts: [{ t: "evo", text: "Okay — I can help. Want to look at the thought, or calm your body first?" }, { t: "chips", options: ["Untangle the thought", "Calm me first", "Keep talking"], indent: true }], patch: { listening: false } };
}

/** X7 · "Say it simpler": the first sentence, without the softeners. */
export function simplify(text: string) {
  const first = text.split(/(?<=[.?!])\s/)[0];
  return first.replace(/^(Thank you( for telling me)?|Mm|Okay|I hear you)[.,—–-]\s*/i, "").replace(/\s*—.*$/, ".").trim() || first;
}

function repair(): NewPart[] {
  return [{ t: "evo", text: "Thank you for telling me — I moved too fast. What would help more right now?" }, { t: "repair" }];
}

function splitLines(text: string) {
  return text
    .split(/\n|;|,| and (?=[a-z])/i)
    .map((s) => s.trim().replace(/^[-•]\s*/, ""))
    .filter((s) => s.length > 1)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .slice(0, 4);
}

/** "My idea got missed today. That doesn't make me useless — …" built from the user's words. */
export function fairerFrom(thought: string, against: string[]) {
  const label = thought.match(/\bi'?m (?:so |such an? |just )?([a-z ]+?)(?:[.!,]|$)/i)?.[1]?.trim();
  const evidence = against[0] ? against[0][0].toLowerCase() + against[0].slice(1) : "there's more to the story";
  return label ? `"This was a hard moment. It doesn't make me ${label} — ${evidence}."` : `"It feels true right now, but it's not the whole picture — ${evidence}."`;
}

function evidence(chat: Chat, text: string, me: NewPart, patch: Partial<Chat>): Reply {
  const supports = splitLines(chat.evidenceFor ?? "");
  const against = splitLines(text);
  const fairer = fairerFrom(chat.thought ?? "", against);
  const before = chat.belief?.[0] ?? 80;
  return {
    parts: [me, { t: "evidence", supports, against }, { t: "evo", text: "Here's a fairer way to say it — built from your words:" }, { t: "fairer", text: fairer, thought: chat.thought ?? "", before }],
    patch: { ...patch, stage: undefined, fairer },
  };
}

function onPick(chat: Chat, part: Part, value: string): Reply {
  const me = (text: string): NewPart => ({ t: "me", text });
  switch (part.t) {
    case "options":
      return { parts: [me(value), { t: "evo", text: "That sounds painful. Can I ask — from 0 to 10, how much is it still on your mind?" }, { t: "scale", label: "How much is it on your mind?" }], patch: { topic: chat.topic || topicOf(value) } };
    case "scale": {
      const n = Number(value);
      if (chat.stage === "belief") return { parts: [{ t: "evo", text: "Okay. What supports the thought? A line or two is enough." }], patch: { stage: "ev-for", belief: [n * 10, n * 10] } };
      return { parts: [{ t: "evo", text: n >= 7 ? "That's a lot to hold. Let's go slowly — what happened?" : "Okay. Tell me what happened?" }] };
    }
    case "chips":
      return onChip(chat, value);
    case "safety":
      if (value === "Sometimes, yes")
        return { parts: [me(value), { t: "evo", text: "Thank you for trusting me with that. You don't have to carry it alone — I'm staying right here." }, { t: "chips", options: ["Open my safety plan", "Call Tele-MANAS 14416", "Keep talking"], indent: true }], patch: { stage: "safety-yes", listening: true } };
      if (value === "No — I'm just exhausted")
        return { parts: [me(value), { t: "evo", text: "Thank you for telling me. Exhausted makes everything feel pointless. Want to rest your body for a minute, or keep talking?" }, { t: "chips", options: ["Calm me first", "Keep talking"], indent: true }], patch: { stage: undefined } };
      return { parts: [me(value), { t: "evo", text: "That's okay. I'm here either way — and a real person is always one tap away." }], patch: { stage: undefined } };
    case "softcheck":
      return { parts: [me(value), { t: "evo", text: "Thank you for telling me. Exhausted makes everything feel heavier. Want to rest your body for a minute, or keep talking?" }, { t: "chips", options: ["Calm me first", "Keep talking"], indent: true }], patch: { stage: undefined } };
    case "repair":
      if (value === "Just listen for a while") return { parts: [{ t: "status", text: "Evo switched to listening mode" }, { t: "evo", text: "I'm here. Say as much or as little as you want." }], patch: { listening: true } };
      if (value === "Say things more simply") return { parts: [{ t: "status", text: "Evo will keep things simple" }, { t: "evo", text: "Okay. Short and simple. What's hardest right now?" }], patch: { simpler: true } };
      if (value === "Try a different way") return { parts: [{ t: "evo", text: "Okay. Would it help to calm your body first, or just get it all out?" }, { t: "chips", options: ["Calm me first", "Get it all out"], indent: true }] };
      return { parts: [{ t: "evo", text: "Thank you. What's happening with your family?" }], patch: { topic: "family" } };
    case "fairer":
      if (value === "That fits") return { parts: [{ t: "evo", text: "That's a real shift. Want to turn it into one small step?" }], patch: { suggest: ["Pick a small step", "Keep talking", "Wrap up"] } };
      if (value === "Edit the words") return { parts: [{ t: "evo", text: "Of course — write it your way. I'll keep it." }], patch: { stage: "edit-fairer" } };
      return { parts: [{ t: "evo", text: "That's okay — some thoughts take a few tries. We can come back to it." }], patch: { suggest: ["Keep talking", "Wrap up"] } };
    default:
      return { parts: [] };
  }
}

function onChip(chat: Chat, value: string): Reply {
  const me: NewPart = { t: "me", text: value };
  switch (value) {
    case "Check the evidence":
      return { parts: [{ t: "evo", text: "First — from 0 to 10, how much do you believe it right now?" }, { t: "scale", label: "How much do you believe it?" }], patch: { stage: "belief" } };
    case "That's not it":
      return { parts: [me, ...repair()] };
    case "Not now":
    case "Not yet":
      return { parts: [{ t: "evo", text: "Okay. We can come back to it whenever you like." }], patch: { suggest: ["Keep talking", "Wrap up"] } };
    case "Yes, exactly":
      return { parts: [{ t: "evo", text: "Mm. I'm here. Keep going whenever you're ready." }] };
    case "Not quite":
      return { parts: [{ t: "evo", text: "Thank you — tell me what I missed?" }] };
    case "Calm me first":
      return { parts: [{ t: "evo", text: "Let's slow your body first — one minute, right here. We'll talk after." }, { t: "breath" }] };
    case "Calmer":
      return { parts: [{ t: "evo", text: "Good. Want to talk about what got you here?" }], patch: { suggest: ["Tell me more", "Wrap up"] } };
    case "About the same":
      return { parts: [{ t: "evo", text: "That's okay — bodies take time. Want another minute, or shall we talk?" }, { t: "chips", options: ["Calm me first", "Keep talking"], indent: true }] };
    case "Still racing":
      return { parts: [{ t: "evo", text: "Let's try grounding instead — it works on racing thoughts." }, { t: "chips", options: ["Try grounding", "Keep talking"], indent: true }] };
    case "Untangle the thought":
      return { parts: [{ t: "evo", text: "Okay. What's the thought that keeps coming back?" }], patch: { listening: false } };
    case "Get it all out":
      return { parts: [{ t: "evo", text: "Go ahead. I won't interrupt." }], patch: { listening: true } };
    case "Keep talking":
      return { parts: [{ t: "evo", text: chat.mode === "night" ? "I'm here. Whisper it." : "I'm here. What's on your mind?" }] };
    default: {
      // A feeling word (X3): ask how strong it is.
      return { parts: [{ t: "slider", label: "How strong is it?", word: value, value: 50 }] };
    }
  }
}

/** Suggestion chips that are simple user turns. */
export function suggestionReply(chat: Chat, value: string): Reply {
  if (value === "Tell me more") {
    const word = chat.feelings.at(-1)?.name.toLowerCase();
    return { parts: [{ t: "me", text: value }, { t: "evo", text: word ? `Feeling ${word} often shows up when something matters to us. What part of it hurts most?` : "Of course. What part of it feels heaviest?" }], patch: { suggest: undefined } };
  }
  if (value === "I want advice") return onText(chat, "I want advice");
  return onChip(chat, value);
}

export type StepIdea = { text: string; note: string; icon: string; bg: string };

/** X10 · three small steps that fit what the chat was about. */
export function stepIdeas(c: Pick<Chat, "topic" | "thought">): StepIdea[] {
  const about = `${c.topic} ${c.thought ?? ""}`.toLowerCase();
  const tell = { text: "Tell someone you trust what happened", note: "Say it out loud to someone safe", icon: "users-lav-19", bg: "bg-lavender-soft" };
  if (/(work|meeting|manager|boss|job|idea|college|exam)/.test(about))
    return [
      { text: "Send a 2-line follow-up", note: "Put today's idea in writing", icon: "chat-sky-19", bg: "bg-sky-soft" },
      { text: "Write down 3 wins this week", note: "So the next one feels less shaky", icon: "star-sun-19", bg: "bg-sun-soft" },
      tell,
    ];
  const who = c.topic.match(/fight with (\w+)/)?.[1];
  if (who || /(family|mum|mom|dad|amma|partner|friend)/.test(about))
    return [
      { text: `Send one kind line to ${who ?? "them"}`, note: "No need to solve it all", icon: "chat-sky-19", bg: "bg-sky-soft" },
      { text: "Write what you wish they knew", note: "Just for you — no sending", icon: "star-sun-19", bg: "bg-sun-soft" },
      tell,
    ];
  if (/(sleep|night|tired)/.test(about))
    return [
      { text: "Phone away 30 min before bed", note: "One night is enough to start", icon: "chat-sky-19", bg: "bg-sky-soft" },
      { text: "Write tomorrow's worry on paper", note: "Then close the notebook", icon: "star-sun-19", bg: "bg-sun-soft" },
      tell,
    ];
  return [
    { text: "Do 2 minutes of the thing you're avoiding", note: "Stop after 2 minutes if you want", icon: "chat-sky-19", bg: "bg-sky-soft" },
    { text: "Write down 3 good things", note: "Tiny ones count", icon: "star-sun-19", bg: "bg-sun-soft" },
    tell,
  ];
}
