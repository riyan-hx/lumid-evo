/** Temporary page body until the screen's build step lands. */
export function Placeholder({ code, title, step }: { code: string; title: string; step: number }) {
  return (
    <div className="glass flex flex-col gap-2 rounded-[24px] p-6">
      <p className="type-label-s text-lime-deep">
        {code} · BUILD STEP {step}
      </p>
      <h1 className="type-screen-title text-forest">{title}</h1>
      <p className="type-body-m text-t2">Spec: Figma → Dev Docs — Web App v1.</p>
    </div>
  );
}
