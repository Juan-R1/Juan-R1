"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { AlertCard } from "@/components/cards/alert-card";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/client-api";
import type { AlertCategory, ServiceAlert } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

interface AlertsResponse {
  alerts: ServiceAlert[];
  origin: "supabase" | "mock";
}

const CATEGORIES: { value: AlertCategory | "all"; labelKey: TranslationKey }[] = [
  { value: "all", labelKey: "alerts.filter.all" },
  { value: "sun_metro", labelKey: "alerts.category.sun_metro" },
  { value: "eta", labelKey: "alerts.category.eta" },
  { value: "bridge", labelKey: "alerts.category.bridge" },
  { value: "weather", labelKey: "alerts.category.weather" },
  { value: "cooling_center", labelKey: "alerts.category.cooling_center" },
  { value: "city", labelKey: "alerts.category.city" },
];

export default function AlertsPage() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<ServiceAlert[] | null>(null);
  const [filter, setFilter] = useState<AlertCategory | "all">("all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch<AlertsResponse>("/api/alerts");
      setAlerts(res.alerts);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!alerts) return [];
    return filter === "all"
      ? alerts
      : alerts.filter((a) => a.category === filter);
  }, [alerts, filter]);

  return (
    <div>
      <PageHeader title={t("alerts.title")} subtitle={t("alerts.subtitle")} />

      <div
        role="group"
        aria-label={t("alerts.filter.all")}
        className="mb-6 flex flex-wrap gap-2"
      >
        {CATEGORIES.map((c) => (
          <Button
            key={c.value}
            size="sm"
            variant={filter === c.value ? "default" : "outline"}
            aria-pressed={filter === c.value}
            onClick={() => setFilter(c.value)}
          >
            {t(c.labelKey)}
          </Button>
        ))}
      </div>

      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? (
        <ErrorState message={t("error.dataUnavailable")} onRetry={load} />
      ) : null}
      {status === "ready" && filtered.length === 0 ? (
        <EmptyState title={t("alerts.empty")} />
      ) : null}

      {status === "ready" && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
