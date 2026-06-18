import "server-only";

import { ApiError } from "@/lib/api";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Require an authenticated user, or throw 401. */
export async function requireUser(): Promise<CurrentUser> {
  if (!isSupabaseConfigured()) {
    throw new ApiError("auth_unavailable", 503);
  }
  const user = await getCurrentUser();
  if (!user) throw new ApiError("unauthorized", 401);
  return user;
}

/**
 * Require an admin user, or throw 401/403.
 *
 * Security note: the role is read from the `profiles` table under the user's own
 * RLS context. This is safe to trust because users cannot escalate their own
 * role — `profileUpdateSchema` (src/lib/validation.ts) deliberately excludes the
 * `role` column, and the `profiles_update_own` RLS policy only allows a user to
 * update their own row (role changes are operator-only, via SQL/service role).
 * Do NOT add `role` to any user-writable schema.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new ApiError("forbidden", 403);
  return user;
}

/**
 * Admin write client. Uses the service role when available (so admin writes are
 * not blocked by RLS edge cases), otherwise throws a clear configuration error.
 */
export function getAdminWriteClient(): SupabaseClient {
  const client = getSupabaseAdminClient();
  if (!client) {
    throw new ApiError("service_role_unconfigured", 503);
  }
  return client;
}
