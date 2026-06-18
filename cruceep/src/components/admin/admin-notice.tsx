"use client";

import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useTranslation } from "@/lib/i18n/context";

export function AdminNotice({
  variant,
}: {
  variant: "unconfigured" | "forbidden";
}) {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t("admin.title")} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <ShieldAlert className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="max-w-md text-muted-foreground">
            {variant === "forbidden"
              ? t("error.forbidden")
              : t("auth.disabled")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
