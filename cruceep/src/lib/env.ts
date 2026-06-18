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
