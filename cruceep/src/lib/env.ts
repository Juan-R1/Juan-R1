/** App-environment helpers used for labeling and feature gating. */

export type AppEnv = "development" | "demo" | "production";

export function getAppEnv(): AppEnv {
  const raw = (
    process.env.NEXT_PUBLIC_APP_ENV ??
    process.env.APP_ENV ??
    "development"
  ).toLowerCase();
  if (raw === "production") return "production";
  if (raw === "demo") return "demo";
  return "development";
}

/** In non-production we surface clearer "this is sample data" affordances. */
export function isDemoLike(): boolean {
  return getAppEnv() !== "production";
}

/**
 * Absolute site origin used for canonical URLs (robots, sitemap, redirects).
 * Prefers an explicit NEXT_PUBLIC_SITE_URL, then Vercel's deployment URL, then
 * localhost for development. Never throws.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

/**
 * Non-fatal configuration check. Logs a warning when running as `production` but
 * key integrations are missing, so misconfiguration is visible in logs without
 * breaking the app (it still degrades to mock data + local storage).
 */
export function warnOnMisconfiguration(): void {
  if (getAppEnv() !== "production") return;
  const issues: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push("Supabase is not configured — auth, saved-route sync, and admin are disabled.");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    issues.push("SUPABASE_SERVICE_ROLE_KEY is unset — admin writes will be disabled.");
  }
  if ((process.env.WEATHER_PROVIDER || "mock") === "mock") {
    issues.push("WEATHER_PROVIDER=mock — set WEATHER_PROVIDER=nws for live weather.");
  }
  if (issues.length > 0) {
    console.warn(
      "[CruceEP] Production configuration notice:\n" +
        issues.map((i) => `  • ${i}`).join("\n")
    );
  }
}
