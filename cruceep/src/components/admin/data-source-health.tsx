"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/client-api";
import { formatRelativeTime } from "@/lib/utils";
import type { DataSourceHealth } from "@/lib/types";

const STATUS_VARIANT: Record<
  DataSourceHealth["status"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  ok: "success",
  degraded: "warning",
  down: "danger",
  mock: "secondary",
};

export function DataSourceHealthPanel() {
  const { t, locale } = useTranslation();
  const [sources, setSources] = useState<DataSourceHealth[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch<{ sources: DataSourceHealth[] }>(
        "/api/admin/data-source-health"
      );
      setSources(res.sources);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState message={t("error.generic")} onRetry={load} />;
  if (!sources || sources.length === 0)
    return <EmptyState title={t("admin.health.noLogs")} />;

  return (
    <div className="space-y-3">
      {sources.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{s.sourceName}</p>
                <Badge variant={STATUS_VARIANT[s.status]}>
                  {t("admin.health.status")}: {s.status}
                </Badge>
              </div>
              {s.lastError ? (
                <p className="mt-1 text-sm text-destructive">
                  {t("admin.health.lastError")}: {s.lastError}
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <dt>{t("admin.health.lastSuccess")}</dt>
              <dd className="text-right">
                {s.lastSuccessAt
                  ? formatRelativeTime(s.lastSuccessAt, locale)
                  : "—"}
              </dd>
              <dt>{t("admin.health.lastFailure")}</dt>
              <dd className="text-right">
                {s.lastFailureAt
                  ? formatRelativeTime(s.lastFailureAt, locale)
                  : "—"}
              </dd>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
