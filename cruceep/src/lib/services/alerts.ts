import "server-only";

import type { ServiceAlert } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapAlertRow } from "@/lib/supabase/mappers";
import { createAlertProvider } from "@/lib/providers/alerts";

export interface AlertsResult {
  alerts: ServiceAlert[];
  /** Where the data actually came from, for source attribution. */
  origin: "supabase" | "mock";
}

/**
 * Read active alerts. When Supabase is configured we return the real (possibly
 * empty) table contents — we do NOT mix in sample data, so an admin who clears
 * alerts sees an empty list. Only when Supabase is unavailable or errors do we
 * fall back to clearly-labeled mock data.
 */
export async function getAlerts(): Promise<AlertsResult> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("active", true)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      return { alerts: data.map(mapAlertRow), origin: "supabase" };
    }
    // fall through to mock on error
  }

  const provider = createAlertProvider();
  return { alerts: await provider.getAlerts(), origin: "mock" };
}
