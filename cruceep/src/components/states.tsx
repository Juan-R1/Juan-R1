"use client";

import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <p className="text-sm">{label ?? t("common.loading")}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
      <p className="max-w-sm text-sm text-foreground">
        {message ?? t("error.generic")}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}
