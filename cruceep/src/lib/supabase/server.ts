import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "./config";

/**
 * Server Supabase client bound to the request cookies (for auth-aware reads and
 * RLS-protected writes). Returns null when Supabase is not configured.
 *
 * Async because Next.js 15 made `cookies()` asynchronous.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          );
        } catch {
          // `set` throws in Server Components; middleware/route handlers refresh
          // the session instead. Safe to ignore here.
        }
      },
    },
  });
}

/**
 * Privileged service-role client for admin/server-only operations. Bypasses RLS
 * — never expose to the browser. Returns null when the service role key is unset.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isServiceRoleConfigured()) return null;
  // `server-only` (imported above) guarantees this never reaches a client bundle.
  return createClient(getSupabaseUrl()!, getSupabaseServiceRoleKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
