import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireAdmin, getAdminWriteClient } from "@/lib/api-auth";
import { mapAlertRow } from "@/lib/supabase/mappers";
import { alertInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    await requireAdmin();
    const input = await parseBody(request, alertInputSchema.partial());
    const supabase = getAdminWriteClient();

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.titleEn !== undefined) patch.title_en = input.titleEn;
    if (input.titleEs !== undefined) patch.title_es = input.titleEs;
    if (input.bodyEn !== undefined) patch.body_en = input.bodyEn;
    if (input.bodyEs !== undefined) patch.body_es = input.bodyEs;
    if (input.category !== undefined) patch.category = input.category;
    if (input.severity !== undefined) patch.severity = input.severity;
    if (input.affectedArea !== undefined) patch.affected_area = input.affectedArea || null;
    if (input.source !== undefined) patch.source = input.source;
    if (input.sourceUrl !== undefined) patch.source_url = input.sourceUrl || null;
    if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
    if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
    if (input.active !== undefined) patch.active = input.active;

    const { data, error } = await supabase
      .from("alerts")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw new ApiError("update_failed", 500, error.message);
    if (!data) throw new ApiError("not_found", 404);
    return jsonOk({ alert: mapAlertRow(data) });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    await requireAdmin();
    const supabase = getAdminWriteClient();
    const { error } = await supabase.from("alerts").delete().eq("id", params.id);
    if (error) throw new ApiError("delete_failed", 500, error.message);
    return jsonOk({ id: params.id });
  });
}
