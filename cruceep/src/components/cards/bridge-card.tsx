"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceLine } from "@/components/source-line";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { BridgeWait, CrossingMode } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const MODE_LABEL: Partial<Record<CrossingMode, TranslationKey>> = {
  vehicle: "bridges.vehicle",
  pedestrian: "bridges.pedestrian",
  ready_lane: "bridges.readyLane",
};

function statusBadgeVariant(status: string) {
  if (status === "closed") return "danger" as const;
  if (status === "delay") return "warning" as const;
  return "success" as const;
}

function statusLabelKey(status: string): TranslationKey {
  if (status === "closed") return "bridges.status.closed";
  if (status === "delay") return "bridges.status.delay";
  return "bridges.status.open";
}

export function BridgeCard({
  wait,
  isBest,
  isFavorite,
  onToggleFavorite,
}: {
  wait: BridgeWait;
  isBest?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (bridgeId: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className={cn(isBest && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{wait.bridgeName}</CardTitle>
            {isBest ? (
              <Badge variant="success" className="mt-1">
                {t("bridges.bestNow")}
              </Badge>
            ) : null}
          </div>
          {onToggleFavorite ? (
            <button
              type="button"
              onClick={() => onToggleFavorite(wait.bridgeId)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? t("bridges.favorited") : t("bridges.favorite")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  isFavorite && "fill-secondary text-secondary"
                )}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {wait.lanes.map((lane) => (
            <li
              key={`${lane.mode}-${lane.laneType}`}
              className="flex items-center justify-between gap-3 py-2"
            >
              <span className="text-sm font-medium">
                {MODE_LABEL[lane.mode]
                  ? t(MODE_LABEL[lane.mode]!)
                  : lane.laneType ?? lane.mode}
              </span>
              <span className="flex items-center gap-2">
                {lane.waitMinutes === null ? (
                  <span className="text-sm text-muted-foreground">
                    {t("bridges.noWait")}
                  </span>
                ) : (
                  <span className="text-lg font-semibold tabular-nums">
                    {lane.waitMinutes}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("common.minutes")}
                    </span>
                  </span>
                )}
                <Badge variant={statusBadgeVariant(lane.status)}>
                  {t(statusLabelKey(lane.status))}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
        <SourceLine
          source={wait.attribution.source}
          sourceUrl={wait.attribution.sourceUrl}
          lastUpdated={wait.attribution.lastUpdated}
          confidence={wait.attribution.confidence}
        />
      </CardContent>
    </Card>
  );
}
