import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO timestamp into a short, locale-aware "last updated" string.
 * Falls back gracefully if the value is missing or invalid.
 */
export function formatRelativeTime(
  iso: string | null | undefined,
  locale: string = "en",
  now: Date = new Date()
): string {
  if (!iso) return locale === "es" ? "sin datos" : "no data";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return locale === "es" ? "sin datos" : "no data";
  }
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.round(diffMs / 60000);

  const rtf = new Intl.RelativeTimeFormat(locale === "es" ? "es" : "en", {
    numeric: "auto",
  });

  if (Math.abs(diffMin) < 1) {
    return locale === "es" ? "ahora mismo" : "just now";
  }
  if (Math.abs(diffMin) < 60) {
    return rtf.format(-diffMin, "minute");
  }
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) {
    return rtf.format(-diffHr, "hour");
  }
  const diffDay = Math.round(diffHr / 24);
  return rtf.format(-diffDay, "day");
}

/** Format an absolute timestamp for display + tooltips. */
export function formatTimestamp(
  iso: string | null | undefined,
  locale: string = "en"
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Stable id generator that works in browser and node test environments. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
