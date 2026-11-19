import type { Metadata, Viewport } from "next";
import { OfflineBanner } from "@/components/states/offline-banner";
import { ToastProvider } from "@/components/states/toast";
import { ProfileProvider } from "@/lib/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evo",
  description: "A calm place for heavy days.",
  appleWebApp: { capable: true, title: "Evo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f8f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-paper font-sans text-t1">
        <ProfileProvider>
          <ToastProvider>
            <OfflineBanner />
            {children}
          </ToastProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
