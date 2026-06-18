"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { BridgeCard } from "@/components/cards/bridge-card";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/client-api";
import { favoriteBridges } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import type { BridgeWait, CrossingDirection } from "@/lib/types";

interface BridgesResponse {
  direction: CrossingDirection;
  waits: BridgeWait[];
  provider: string;
}

/** Index of the lane used to rank "shortest wait now" (vehicle general lane). */
function vehicleWait(w: BridgeWait): number | null {
  const lane = w.lanes.find((l) => l.mode === "vehicle");
  return lane?.waitMinutes ?? null;
}

export default function BridgesPage() {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<CrossingDirection>("northbound");
  const [waits, setWaits] = useState<BridgeWait[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async (dir: CrossingDirection) => {
    setStatus("loading");
    try {
      const res = await apiFetch<BridgesResponse>(`/api/bridges?direction=${dir}`);
      setWaits(res.waits);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    setFavorites(favoriteBridges.list());
  }, []);

  useEffect(() => {
    load(direction);
  }, [direction, load]);

  const onToggleFavorite = (id: string) => {
    setFavorites(favoriteBridges.toggle(id));
  };

  // Determine the bridge with the shortest reported vehicle wait.
  let bestId: string | null = null;
  if (waits) {
    let best = Number.POSITIVE_INFINITY;
    for (const w of waits) {
      const v = vehicleWait(w);
      if (v !== null && v < best) {
        best = v;
        bestId = w.bridgeId;
      }
    }
  }

  return (
    <div>
      <PageHeader title={t("bridges.title")} subtitle={t("bridges.subtitle")} />

      <div
        role="group"
        aria-label={t("bridges.direction")}
        className="mb-6 inline-flex rounded-lg border border-border bg-muted p-1"
      >
        {(["northbound", "southbound"] as CrossingDirection[]).map((dir) => (
          <Button
            key={dir}
            variant={direction === dir ? "default" : "ghost"}
            size="sm"
            aria-pressed={direction === dir}
            onClick={() => setDirection(dir)}
            className={cn(direction !== dir && "text-muted-foreground")}
          >
            {t(`bridges.direction.${dir}`)}
          </Button>
        ))}
      </div>

      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? (
        <ErrorState
          message={t("error.dataUnavailable")}
          onRetry={() => load(direction)}
        />
      ) : null}
      {status === "ready" && waits && waits.length === 0 ? (
        <EmptyState title={t("bridges.empty")} />
      ) : null}

      {status === "ready" && waits && waits.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {waits.map((wait) => (
            <BridgeCard
              key={wait.bridgeId}
              wait={wait}
              isBest={wait.bridgeId === bestId}
              isFavorite={favorites.includes(wait.bridgeId)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
