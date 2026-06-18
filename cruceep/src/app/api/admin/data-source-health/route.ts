import { handleRoute, jsonOk, ApiError } from "@/lib/api";
import { requireAdmin, getAdminWriteClient } from "@/lib/api-auth";
import { mapDataSourceHealthRow } from "@/lib/supabase/mappers";
import type { DataSourceHealth } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Returns the data_source_health table. When the table is empty (fresh DB) we
 * synthesize a baseline view from the configured providers so admins still see
 * which sources are wired up and that they are currently running on mock data.
 */
export async function GET() {
  return handleRoute(async () => {
    await requireAdmin();
    const supabase = getAdminWriteClient();
    const { data, error } = await supabase
      .from("data_source_health")
      .select("*")
      .order("source_name", { ascending: true });

    if (error) throw new ApiError("read_failed", 500, error.message);

    if (data && data.length > 0) {
      return jsonOk({ sources: data.map(mapDataSourceHealthRow) });
    }

    const now = new Date().toISOString();
    const baseline: DataSourceHealth[] = [
      "Border Wait Times",
      "Transit (Sun Metro / ETA)",
      "Weather (NWS)",
      "Alerts",
      "Cooling Centers",
    ].map((name, i) => ({
      id: `baseline-${i}`,
      sourceName: name,
      status: "mock",
      lastSuccessAt: now,
      lastFailureAt: null,
      lastError: null,
      metadata: { note: "No ingestion runs recorded yet; running on mock data." },
      updatedAt: now,
    }));

    return jsonOk({ sources: baseline, synthesized: true });
  });
}
