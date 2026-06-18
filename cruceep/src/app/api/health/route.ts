import { NextResponse } from "next/server";
import { getAppEnv } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Public health/status endpoint for uptime monitors. Exposes no secrets — only
 * which integrations are wired up and which data providers are active.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    name: "CruceEP",
    env: getAppEnv(),
    time: new Date().toISOString(),
    integrations: {
      supabase: isSupabaseConfigured(),
    },
    providers: {
      borderWait: process.env.BORDER_WAIT_PROVIDER || "mock",
      transit: process.env.TRANSIT_PROVIDER || "mock",
      weather: process.env.WEATHER_PROVIDER || "mock",
      alerts: process.env.ALERT_PROVIDER || "mock",
    },
  });
}
