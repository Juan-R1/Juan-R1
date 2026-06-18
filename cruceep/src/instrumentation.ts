/**
 * Next.js instrumentation hook — runs once when the server starts.
 * We use it for a non-fatal production configuration check (logged, never throws).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warnOnMisconfiguration } = await import("@/lib/env");
    warnOnMisconfiguration();
  }
}
