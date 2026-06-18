"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./config";

let cached: SupabaseClient | null = null;

/**
 * Returns a browser Supabase client, or `null` when Supabase is not configured.
 * Callers must handle the null case (fall back to local storage / disabled UI).
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
  return cached;
}
