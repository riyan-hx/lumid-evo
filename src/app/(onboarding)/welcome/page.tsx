import Link from "next/link";
import { ImageSlot } from "@/components/figma/parts";
import { FigmaScreen, Grow } from "@/components/figma/screen";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";

const PROMPT =
  "Soft 3D clay illustration: a young person sitting by a window at dusk, wrapped in a blanket, holding a warm cup, a small glowing lime-green orb floating beside them, calm and hopeful, palette of soft greens, cream and warm peach, lots of negative space, no text, 4:3";

/** 1.1 · Welcome — Figma node 112:1292 */
export default function Welcome() {
  return (
    <FigmaScreen gap={16} pt={62}>
      <div className="relative">
        <ImageSlot prompt={PROMPT} height={290} />
        <div className="absolute top-[238px] right-[3px]">
          <Orb size={76} />
        </div>
      </div>
      <h1 className="text-[28px] leading-[1.1] font-medium tracking-[-0.7px] text-forest">A calm place for heavy days.</h1>
      <p className="type-body-m text-t2">Evo listens, helps you name what you feel, and turns it into one small, kind step — using proven tools like CBT.</p>
      <ul className="flex flex-wrap gap-2">
        {["Tap, don't type", "Malayalam + English", "Private by default"].map((t) => (
          <li key={t} className="flex h-11 items-center rounded-full border border-white bg-white/70 px-[18px] type-label-m text-t3 backdrop-blur-[8px]">
            {t}
          </li>
        ))}
      </ul>
      <Grow />
      <Pill label="Start with Evo" href="/sign-in" className="w-full" />
      <Link href="/sign-in?returning=1" className="text-center type-label-m text-t2">
        I already have an account
      </Link>
    </FigmaScreen>
  );
}
