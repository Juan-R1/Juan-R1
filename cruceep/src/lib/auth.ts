import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/types";

export type UserRole = "user" | "admin";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  preferredLanguage: Locale;
}

/**
 * Resolve the signed-in user and their profile (including role). Returns null
 * when Supabase is not configured or no session exists. Never throws.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? null,
    role: (profile?.role as UserRole) ?? "user",
    preferredLanguage: (profile?.preferred_language as Locale) ?? "en",
  };
}

/** True when the current user exists and has the admin role. */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
