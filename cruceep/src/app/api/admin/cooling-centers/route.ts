import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireAdmin, getAdminWriteClient } from "@/lib/api-auth";
import { mapCoolingCenterRow } from "@/lib/supabase/mappers";
import { coolingCenterInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** List ALL cooling centers (active + inactive) for admin management. */
export async function GET() {
  return handleRoute(async () => {
    await requireAdmin();
    const supabase = getAdminWriteClient();
    const { data, error } = await supabase
      .from("cooling_centers")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new ApiError("read_failed", 500, error.message);
    return jsonOk({ centers: (data ?? []).map(mapCoolingCenterRow) });
  });
}

/** Create a cooling center. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireAdmin();
    const input = await parseBody(request, coolingCenterInputSchema);
    const supabase = getAdminWriteClient();

    const { data, error } = await supabase
      .from("cooling_centers")
      .insert({
        name: input.name,
        type: input.type,
        address: input.address,
        phone: input.phone || null,
        website: input.website || null,
        hours_en: input.hoursEn || null,
        hours_es: input.hoursEs || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        source: input.source,
        source_url: input.sourceUrl || null,
        last_verified_at: input.lastVerifiedAt ?? null,
        active: input.active,
      })
      .select("*")
      .single();

    if (error) throw new ApiError("save_failed", 500, error.message);
    return jsonOk({ center: mapCoolingCenterRow(data) }, { status: 201 });
  });
}
