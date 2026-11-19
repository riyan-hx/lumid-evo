/** Safety routes: no auth wall, no nav distractions (Dev Docs board 07). */
export default function SafetyLayout({ children }: LayoutProps<"/">) {
  return <main id="main" className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-4 py-8">{children}</main>;
}
