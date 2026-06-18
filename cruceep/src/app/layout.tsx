import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ClientUser } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "CruceEP — El Paso–Juárez mobility & border navigator",
    template: "%s · CruceEP",
  },
  description:
    "Plan El Paso and border trips in one place: compare bridge wait times, check transit, see alerts and heat risk, and save your routes. Bilingual (English/Spanish).",
  manifest: "/manifest.webmanifest",
  applicationName: "CruceEP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CruceEP",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a7ea4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAuthEnabled = isSupabaseConfigured();

  const initialUser: ClientUser | null = user
    ? {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      }
    : null;

  return (
    <html lang={user?.preferredLanguage ?? "en"} suppressHydrationWarning>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <AppShell
          initialUser={initialUser}
          isAuthEnabled={isAuthEnabled}
          initialLocale={user?.preferredLanguage ?? "en"}
        >
          <div id="main-content">{children}</div>
        </AppShell>
      </body>
    </html>
  );
}
