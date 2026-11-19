/** Accent tones from the Evo DS (accent/<tone>/soft + accent/<tone>/text). */
export type Tone = "lime" | "lavender" | "mint" | "peach" | "sky" | "sun";

export const tone: Record<Tone, { soft: string; text: string }> = {
  lime: { soft: "bg-lime-soft", text: "text-lime-deep" },
  lavender: { soft: "bg-lavender-soft", text: "text-lavender-text" },
  mint: { soft: "bg-mint-soft", text: "text-mint-text" },
  peach: { soft: "bg-peach-soft", text: "text-peach-text" },
  sky: { soft: "bg-sky-soft", text: "text-sky-text" },
  sun: { soft: "bg-sun-soft", text: "text-sun-text" },
};
