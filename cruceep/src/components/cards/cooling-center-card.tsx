"use client";

import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import { formatRelativeTime } from "@/lib/utils";
import { directionsUrl } from "@/lib/map";
import type { CoolingCenter, CoolingCenterType } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TYPE_LABEL: Record<CoolingCenterType, TranslationKey> = {
  cooling_center: "cooling.type.cooling_center",
  library: "cooling.type.library",
  public_facility: "cooling.type.public_facility",
  shelter: "cooling.type.shelter",
  recreation_center: "cooling.type.recreation_center",
};

export function CoolingCenterCard({ center }: { center: CoolingCenter }) {
  const { t, locale } = useTranslation();
  const hours = locale === "es" ? center.hoursEs : center.hoursEn;
  const mapsHref = directionsUrl(center.address);

  return (
    <Card>
      <CardHeader className="pb-3">
        <Badge variant="info" className="w-fit">
          {t(TYPE_LABEL[center.type])}
        </Badge>
        <CardTitle className="mt-2 text-base">{center.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>{center.address}</span>
        </p>
        {hours ? (
          <p className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              <span className="sr-only">{t("cooling.hours")}: </span>
              {hours}
            </span>
          </p>
        ) : null}
        {center.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <a href={`tel:${center.phone}`} className="text-primary hover:underline">
              {center.phone}
            </a>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("cooling.directions")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          {center.website ? (
            <a
              href={center.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t("cooling.website")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          {t("common.source")}: {center.source} ·{" "}
          {center.lastVerifiedAt
            ? `${t("cooling.lastVerified")}: ${formatRelativeTime(
                center.lastVerifiedAt,
                locale
              )}`
            : t("cooling.notVerified")}
        </p>
      </CardContent>
    </Card>
  );
}
