"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { CoolingCentersAdmin } from "@/components/admin/cooling-centers-admin";
import { AlertsAdmin } from "@/components/admin/alerts-admin";
import { DataSourceHealthPanel } from "@/components/admin/data-source-health";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type Tab = "coolingCenters" | "alerts" | "health";

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: "coolingCenters", labelKey: "admin.tab.coolingCenters" },
  { id: "alerts", labelKey: "admin.tab.alerts" },
  { id: "health", labelKey: "admin.tab.health" },
];

export function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("coolingCenters");

  return (
    <div>
      <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />

      <div
        role="tablist"
        aria-label={t("admin.title")}
        className="mb-6 flex flex-wrap gap-2 border-b border-border"
      >
        {TABS.map((tabItem) => (
          <Button
            key={tabItem.id}
            role="tab"
            aria-selected={tab === tabItem.id}
            variant="ghost"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "rounded-b-none border-b-2",
              tab === tabItem.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            {t(tabItem.labelKey)}
          </Button>
        ))}
      </div>

      {tab === "coolingCenters" ? <CoolingCentersAdmin /> : null}
      {tab === "alerts" ? <AlertsAdmin /> : null}
      {tab === "health" ? <DataSourceHealthPanel /> : null}
    </div>
  );
}
