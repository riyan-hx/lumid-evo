/** Onboarding screens render their own Figma frame (FigmaScreen). */
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return <main id="main">{children}</main>;
}
