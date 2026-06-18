"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { formatRelativeTime, formatTimestamp } from "@/lib/utils";
import type { DataConfidence } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";

interface SourceLineProps {
  source: string;
  sourceUrl?: string | null;
  lastUpdated?: string | null;
  confidence?: DataConfidence;
}

/**
 * Standard source-attribution footer for every dynamic data card:
 * "Source • Last updated • [Confidence badge]".
 */
export function SourceLine({
  source,
  sourceUrl,
  lastUpdated,
  confidence,
}: SourceLineProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span>
        <span className="font-medium">{t("common.source")}:</span>{" "}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary underline-offset-2 hover:underline"
          >
            {source}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">{t("common.viewSource")}</span>
          </a>
        ) : (
          source
        )}
      </span>
      {lastUpdated ? (
        <span title={formatTimestamp(lastUpdated, locale)}>
          {t("common.lastUpdated")}: {formatRelativeTime(lastUpdated, locale)}
        </span>
      ) : null}
      {confidence ? <ConfidenceBadge confidence={confidence} /> : null}
    </div>
  );
}
