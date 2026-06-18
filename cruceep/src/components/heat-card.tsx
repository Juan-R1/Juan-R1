"use client";

import Link from "next/link";
import { Droplets, Thermometer, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceLine } from "@/components/source-line";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { HeatCaution, WeatherSnapshot } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const CAUTION_LABEL: Record<HeatCaution, TranslationKey> = {
  low: "heat.caution.low",
  moderate: "heat.caution.moderate",
  high: "heat.caution.high",
  extreme: "heat.caution.extreme",
};

const CAUTION_VARIANT: Record<
  HeatCaution,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  low: "success",
  moderate: "info",
  high: "warning",
  extreme: "danger",
};

const CAUTION_RING: Record<HeatCaution, string> = {
  low: "",
  moderate: "",
  high: "ring-1 ring-amber-300",
  extreme: "ring-2 ring-destructive",
};

export function HeatCard({ weather }: { weather: WeatherSnapshot }) {
  const { t } = useTranslation();

  return (
    <Card className={cn(CAUTION_RING[weather.caution])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-5 w-5 text-secondary" aria-hidden="true" />
            {t("heat.title")}
          </CardTitle>
          <Badge variant={CAUTION_VARIANT[weather.caution]}>
            {t("heat.caution")}: {t(CAUTION_LABEL[weather.caution])}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-3xl font-bold tabular-nums">
              {weather.temperatureF}°F
            </p>
            <p className="text-xs text-muted-foreground">
              {t("heat.feelsLike")} {weather.feelsLikeF}°F · {weather.conditions}
            </p>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm">
          <TriangleAlert
            className={cn(
              "h-4 w-4",
              weather.advisory ? "text-destructive" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          <span className="font-medium">{t("heat.advisory")}:</span>{" "}
          {weather.advisory ? t("heat.advisory.active") : t("heat.advisory.none")}
        </p>

        <p className="flex items-start gap-2 rounded-md bg-accent/60 p-3 text-sm text-accent-foreground">
          <Droplets className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t("heat.reminder")}
        </p>

        <Link
          href="/cooling-centers"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          {t("heat.coolingNearby.view")} →
        </Link>

        <SourceLine
          source={weather.attribution.source}
          sourceUrl={weather.attribution.sourceUrl}
          lastUpdated={weather.attribution.lastUpdated}
          confidence={weather.attribution.confidence}
        />
      </CardContent>
    </Card>
  );
}
