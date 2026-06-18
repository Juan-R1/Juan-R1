"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceLine } from "@/components/source-line";
import { useTranslation } from "@/lib/i18n/context";
import type { AlertCategory, AlertSeverity, ServiceAlert } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const SEVERITY_VARIANT: Record<
  AlertSeverity,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  info: "info",
  minor: "secondary",
  major: "warning",
  severe: "danger",
};

const SEVERITY_LABEL: Record<AlertSeverity, TranslationKey> = {
  info: "alerts.severity.info",
  minor: "alerts.severity.minor",
  major: "alerts.severity.major",
  severe: "alerts.severity.severe",
};

const CATEGORY_LABEL: Record<AlertCategory, TranslationKey> = {
  sun_metro: "alerts.category.sun_metro",
  eta: "alerts.category.eta",
  bridge: "alerts.category.bridge",
  weather: "alerts.category.weather",
  cooling_center: "alerts.category.cooling_center",
  city: "alerts.category.city",
};

export function AlertCard({ alert }: { alert: ServiceAlert }) {
  const { t, locale } = useTranslation();
  const title = locale === "es" ? alert.titleEs : alert.titleEn;
  const body = locale === "es" ? alert.bodyEs : alert.bodyEn;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={SEVERITY_VARIANT[alert.severity]}>
            {t(SEVERITY_LABEL[alert.severity])}
          </Badge>
          <Badge variant="outline">{t(CATEGORY_LABEL[alert.category])}</Badge>
        </div>
        <CardTitle className="mt-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
        {alert.affectedArea ? (
          <p className="mt-2 text-sm">
            <span className="font-medium">{t("alerts.affectedArea")}:</span>{" "}
            {alert.affectedArea}
          </p>
        ) : null}
        <SourceLine
          source={alert.source}
          sourceUrl={alert.sourceUrl}
          lastUpdated={alert.lastUpdated}
          confidence={alert.confidence}
        />
      </CardContent>
    </Card>
  );
}
