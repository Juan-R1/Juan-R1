"use client";

import { useTranslation } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8 text-center text-xs text-muted-foreground">
        <p className="mx-auto max-w-2xl">{t("footer.disclaimer")}</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {t("app.name")} · {t("app.tagline")}
        </p>
      </div>
    </footer>
  );
}
