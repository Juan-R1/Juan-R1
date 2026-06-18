import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireAdmin, getAdminWriteClient } from "@/lib/api-auth";
import { mapCoolingCenterRow } from "@/lib/supabase/mappers";
import { coolingCenterInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { id } = await params;
    await requireAdmin();
    const input = await parseBody(request, coolingCenterInputSchema.partial());
    const supabase = getAdminWriteClient();

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.type !== undefined) patch.type = input.type;
    if (input.address !== undefined) patch.address = input.address;
    if (input.phone !== undefined) patch.phone = input.phone || null;
    if (input.website !== undefined) patch.website = input.website || null;
    if (input.hoursEn !== undefined) patch.hours_en = input.hoursEn || null;
    if (input.hoursEs !== undefined) patch.hours_es = input.hoursEs || null;
    if (input.latitude !== undefined) patch.latitude = input.latitude;
    if (input.longitude !== undefined) patch.longitude = input.longitude;
    if (input.source !== undefined) patch.source = input.source;
    if (input.sourceUrl !== undefined) patch.source_url = input.sourceUrl || null;
    if (input.lastVerifiedAt !== undefined)
      patch.last_verified_at = input.lastVerifiedAt;
    if (input.active !== undefined) patch.active = input.active;

    const { data, error } = await supabase
      .from("cooling_centers")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new ApiError("update_failed", 500, error.message);
    if (!data) throw new ApiError("not_found", 404);
    return jsonOk({ center: mapCoolingCenterRow(data) });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRoute(async () => {
    const { id } = await params;
    await requireAdmin();
    const supabase = getAdminWriteClient();
    const { error } = await supabase
      .from("cooling_centers")
      .delete()
      .eq("id", id);
    if (error) throw new ApiError("delete_failed", 500, error.message);
    return jsonOk({ id });
  });
}
