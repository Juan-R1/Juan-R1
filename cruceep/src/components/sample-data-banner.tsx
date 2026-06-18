"use client";

import { Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { isDemoLike } from "@/lib/env";

/**
 * Site-wide trust banner shown when the app is running in a demo-like
 * environment or without Supabase (i.e. likely on sample/mock data). Individual
 * cards still carry their own confidence badges; this reinforces it globally so
 * sample data is never mistaken for official data.
 */
export function SampleDataBanner({ isAuthEnabled }: { isAuthEnabled: boolean }) {
  const { locale } = useTranslation();
  if (!isDemoLike() && isAuthEnabled) return null;

  const text =
    locale === "es"
      ? "Modo demostración: algunos datos son de muestra y están claramente etiquetados. Confirma siempre con fuentes oficiales."
      : "Demo mode: some data is sample data and clearly labeled. Always confirm with official sources.";

  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 text-amber-900"
    >
      <div className="container flex items-center gap-2 py-2 text-xs">
        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
}
