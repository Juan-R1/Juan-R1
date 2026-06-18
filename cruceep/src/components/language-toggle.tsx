"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

/** Compact EN/ES toggle. Persists the choice via the i18n provider. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale, t } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className={className}
      aria-label={t("lang.label")}
      title={t("lang.label")}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span>{locale === "en" ? "ES" : "EN"}</span>
    </Button>
  );
}
