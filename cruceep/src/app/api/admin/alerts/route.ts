import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireAdmin, getAdminWriteClient } from "@/lib/api-auth";
import { mapAlertRow } from "@/lib/supabase/mappers";
import { alertInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** List ALL alerts (active + inactive) for admin management. */
export async function GET() {
  return handleRoute(async () => {
    await requireAdmin();
    const supabase = getAdminWriteClient();
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new ApiError("read_failed", 500, error.message);
    return jsonOk({ alerts: (data ?? []).map(mapAlertRow) });
  });
}

/** Create a manual alert. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAdmin();
    const input = await parseBody(request, alertInputSchema);
    const supabase = getAdminWriteClient();

    const { data, error } = await supabase
      .from("alerts")
      .insert({
        title_en: input.titleEn,
        title_es: input.titleEs,
        body_en: input.bodyEn,
        body_es: input.bodyEs,
        category: input.category,
        severity: input.severity,
        affected_area: input.affectedArea || null,
        source: input.source,
        source_url: input.sourceUrl || null,
        starts_at: input.startsAt ?? null,
        ends_at: input.endsAt ?? null,
        active: input.active,
      })
      .select("*")
      .single();

    if (error) throw new ApiError("save_failed", 500, error.message);
    return jsonOk({ alert: mapAlertRow(data) }, { status: 201 });
  });
}
