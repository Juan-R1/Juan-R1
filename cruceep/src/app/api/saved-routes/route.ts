import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mapSavedRouteRow } from "@/lib/supabase/mappers";
import { savedRouteInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** List the signed-in user's saved routes. */
export async function GET() {
  return handleRoute(async () => {
    const user = await requireUser();
    const supabase = getSupabaseServerClient()!;
    const { data, error } = await supabase
      .from("saved_routes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw new ApiError("read_failed", 500, error.message);
    return jsonOk({ routes: (data ?? []).map(mapSavedRouteRow) });
  });
}

/** Create a saved route for the signed-in user. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const input = await parseBody(request, savedRouteInputSchema);
    const supabase = getSupabaseServerClient()!;

    const { data, error } = await supabase
      .from("saved_routes")
      .insert({
        user_id: user.id,
        name: input.name,
        origin: input.origin,
        destination: input.destination,
        trip_type: input.tripType,
        preferred_mode: input.preferredMode,
        favorite_bridge: input.favoriteBridge ?? null,
        metadata: input.metadata ?? {},
      })
      .select("*")
      .single();

    if (error) throw new ApiError("save_failed", 500, error.message);
    return jsonOk({ route: mapSavedRouteRow(data) }, { status: 201 });
  });
}
