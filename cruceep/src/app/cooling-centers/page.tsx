"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { CoolingCenterCard } from "@/components/cards/cooling-center-card";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { useTranslation } from "@/lib/i18n/context";
import { apiFetch } from "@/lib/client-api";
import type { CoolingCenter } from "@/lib/types";

interface CoolingResponse {
  centers: CoolingCenter[];
  origin: "supabase" | "mock";
}

export default function CoolingCentersPage() {
  const { t } = useTranslation();
  const [centers, setCenters] = useState<CoolingCenter[] | null>(null);
  const [origin, setOrigin] = useState<"supabase" | "mock">("mock");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await apiFetch<CoolingResponse>("/api/cooling-centers");
      setCenters(res.centers);
      setOrigin(res.origin);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title={t("cooling.title")}
        subtitle={t("cooling.subtitle")}
        actions={
          status === "ready" ? (
            <ConfidenceBadge confidence={origin === "mock" ? "mock" : "live"} />
          ) : undefined
        }
      />

      {status === "loading" ? <LoadingState /> : null}
      {status === "error" ? (
        <ErrorState message={t("error.dataUnavailable")} onRetry={load} />
      ) : null}
      {status === "ready" && centers && centers.length === 0 ? (
        <EmptyState title={t("cooling.empty")} />
      ) : null}

      {status === "ready" && centers && centers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {centers.map((center) => (
            <CoolingCenterCard key={center.id} center={center} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
