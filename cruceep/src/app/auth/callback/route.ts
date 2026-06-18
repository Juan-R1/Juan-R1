import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * OAuth / magic-link / email-confirmation callback. Supabase redirects here with
 * a `?code=` parameter (PKCE); we exchange it for a session (which sets the auth
 * cookies) and then forward the user to a safe in-app destination.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Only allow same-origin relative redirects to avoid open-redirects.
  const nextParam = url.searchParams.get("next") ?? "/saved-routes";
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/saved-routes";

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeNext, url.origin));
      }
    }
  }

  // Something went wrong (no code, exchange failed, or Supabase not configured).
  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
