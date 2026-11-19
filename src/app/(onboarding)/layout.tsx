import { CrisisLink } from "@/components/shell/nav";

export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-6">
      <div className="flex w-full max-w-[560px] justify-end">
        <CrisisLink />
      </div>
      <main id="main" className="flex w-full max-w-[480px] flex-1 flex-col justify-center py-8">
        {children}
      </main>
    </div>
  );
}
