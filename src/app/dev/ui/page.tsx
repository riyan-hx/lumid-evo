"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AskEvo, IconTile, SoftChip, Toggle } from "@/components/ui/controls";
import { Message } from "@/components/ui/message";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";
import { IntensitySlider } from "@/components/ui/slider";
import { StatesDemo } from "./states";

/** Living gallery of the design-system primitives (Dev Docs board 04). */
export default function UiGallery() {
  const [chip, setChip] = useState("Anxious");
  const [on, setOn] = useState(true);
  const [level, setLevel] = useState(70);

  return (
    <main className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-12">
      <h1 className="type-screen-title text-forest">Evo UI primitives</h1>
      <div className="flex items-center gap-4">
        <Orb size={56} />
        <Orb size={32} state="thinking" />
        <AskEvo />
      </div>
      <div className="flex flex-wrap gap-3">
        <Pill label="Check in" />
        <Pill label="Start" variant="lime" />
        <Pill label="Not now" variant="glass" icon={null} />
      </div>
      <div className="flex flex-wrap gap-2">
        {["Calm", "Anxious", "Sad", "Angry"].map((l) => (
          <SoftChip key={l} label={l} selected={chip === l} onClick={() => setChip(l)} />
        ))}
      </div>
      <IntensitySlider label="How strong is it?" value={level} onChange={setLevel} />
      <Card>
        <div className="flex items-center gap-3">
          <IconTile icon="heart" bg="bg-peach-soft" color="text-peach-text" />
          <p className="flex-1 type-label-m">Discreet mode</p>
          <Toggle on={on} onChange={setOn} label="Discreet mode" />
        </div>
      </Card>
      <Card variant="tint" tone="lavender">
        <p className="type-label-s text-lavender-text">THINKING TRAP</p>
        <p className="type-title-m">Mind reading</p>
      </Card>
      <div className="flex flex-col gap-3">
        <Message role="system">Tuesday · 21:15</Message>
        <Message role="user">My manager ignored my idea again. I feel useless.</Message>
        <Message role="evo" sub="Your fear said 0%. Your record says ~60%.">
          That stings — being passed over in front of everyone.
        </Message>
      </div>
      <StatesDemo />
    </main>
  );
}
