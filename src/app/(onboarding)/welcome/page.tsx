import Link from "next/link";
import { Orb } from "@/components/ui/orb";
import { Pill } from "@/components/ui/pill";

/** 1.1 · Welcome */
export default function Welcome() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <Orb size={140} state="breathing" />
      <div className="flex flex-col gap-3">
        <h1 className="type-screen-title text-forest">A calm place for heavy days.</h1>
        <p className="type-body-l text-t2">Evo listens, helps you untangle what you feel, and finds one small next step.</p>
      </div>
      <ul className="flex flex-wrap justify-center gap-2" aria-label="What makes Evo different">
        {["Tap, don't type", "Malayalam + English", "Private by default"].map((t) => (
          <li key={t} className="rounded-full border border-white bg-white/70 px-3.5 py-2 type-label-s text-t2">
            {t}
          </li>
        ))}
      </ul>
      <div className="flex w-full flex-col items-center gap-4">
        <Pill label="Start with Evo" href="/sign-in" className="w-full" />
        <Link href="/sign-in?returning=1" className="type-label-m text-t2 underline-offset-4 hover:underline">
          I already have an account
        </Link>
      </div>
    </div>
  );
}
