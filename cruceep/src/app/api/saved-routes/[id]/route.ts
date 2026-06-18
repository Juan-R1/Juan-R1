import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapSavedRouteRow } from "@/lib/supabase/mappers";
import { savedRouteInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Update one of the signed-in user's saved routes. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    const user = await requireUser();
    const input = await parseBody(request, savedRouteInputSchema.partial());
    const supabase = getSupabaseServerClient()!;

    const { data, error } = await supabase
      .from("saved_routes")
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.origin !== undefined ? { origin: input.origin } : {}),
        ...(input.destination !== undefined
          ? { destination: input.destination }
          : {}),
        ...(input.tripType !== undefined ? { trip_type: input.tripType } : {}),
        ...(input.preferredMode !== undefined
          ? { preferred_mode: input.preferredMode }
          : {}),
        ...(input.favoriteBridge !== undefined
          ? { favorite_bridge: input.favoriteBridge }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw new ApiError("update_failed", 500, error.message);
    if (!data) throw new ApiError("not_found", 404);
    return jsonOk({ route: mapSavedRouteRow(data) });
  });
}

/** Delete one of the signed-in user's saved routes. */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    const user = await requireUser();
    const supabase = getSupabaseServerClient()!;

    const { error } = await supabase
      .from("saved_routes")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) throw new ApiError("delete_failed", 500, error.message);
    return jsonOk({ id: params.id });
  });
}
