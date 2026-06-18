"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import type { DataConfidence } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const VARIANT: Record<
  DataConfidence,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  live: "success",
  cached: "info",
  estimated: "warning",
  mock: "secondary",
  unavailable: "danger",
};

const LABEL_KEY: Record<DataConfidence, TranslationKey> = {
  live: "confidence.live",
  cached: "confidence.cached",
  estimated: "confidence.estimated",
  mock: "confidence.mock",
  unavailable: "confidence.unavailable",
};

/**
 * Renders the trust badge for a dynamic value. Use everywhere mock/estimated/
 * live data is shown so users can always tell how much to trust a card.
 */
export function ConfidenceBadge({ confidence }: { confidence: DataConfidence }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[confidence]} aria-label={t(LABEL_KEY[confidence])}>
      {t(LABEL_KEY[confidence])}
    </Badge>
  );
}
