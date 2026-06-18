import "server-only";

import type { CoolingCenter } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapCoolingCenterRow } from "@/lib/supabase/mappers";
import { createCoolingCenterProvider } from "@/lib/providers/cooling-centers";

export interface CoolingCentersResult {
  centers: CoolingCenter[];
  origin: "supabase" | "mock";
}

/**
 * Read active cooling centers. Supabase-first (real contents, possibly empty);
 * mock fallback only when Supabase is unavailable or errors.
 */
export async function getCoolingCenters(): Promise<CoolingCentersResult> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("cooling_centers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (!error && data) {
      return { centers: data.map(mapCoolingCenterRow), origin: "supabase" };
    }
  }

  const provider = createCoolingCenterProvider();
  return { centers: await provider.getCoolingCenters(), origin: "mock" };
}
