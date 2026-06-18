"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider, type ClientUser } from "@/components/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SampleDataBanner } from "@/components/sample-data-banner";
import type { Locale } from "@/lib/types";

/** Registers the PWA service worker once on mount (production only). */
function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration is best-effort; ignore failures.
    });
  }, []);
}

export function AppShell({
  children,
  initialUser,
  isAuthEnabled,
  initialLocale,
}: {
  children: React.ReactNode;
  initialUser: ClientUser | null;
  isAuthEnabled: boolean;
  initialLocale: Locale;
}) {
  useServiceWorker();

  return (
    <I18nProvider initialLocale={initialLocale}>
      <AuthProvider initialUser={initialUser} isAuthEnabled={isAuthEnabled}>
        <div className="flex min-h-dvh flex-col">
          <SampleDataBanner isAuthEnabled={isAuthEnabled} />
          <SiteHeader />
          <main className="container flex-1 py-6 pb-safe-nav lg:pb-10">
            {children}
          </main>
          <SiteFooter />
          <BottomNav />
        </div>
      </AuthProvider>
    </I18nProvider>
  );
}
