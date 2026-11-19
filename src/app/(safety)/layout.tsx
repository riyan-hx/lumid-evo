/** Safety routes: no auth wall, no nav distractions (Dev Docs board 07). Each screen draws its own Figma frame. */
export default function SafetyLayout({ children }: LayoutProps<"/">) {
  return <main id="main">{children}</main>;
}
