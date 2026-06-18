import { handleRoute, jsonOk, parseBody, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/api-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Update the signed-in user's profile (display name, preferred language). */
export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const user = await requireUser();
    const input = await parseBody(request, profileUpdateSchema);
    const supabase = (await getSupabaseServerClient())!;

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.displayName !== undefined) patch.display_name = input.displayName;
    if (input.preferredLanguage !== undefined)
      patch.preferred_language = input.preferredLanguage;

    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id);

    if (error) throw new ApiError("update_failed", 500, error.message);
    return jsonOk({ ok: true });
  });
}
