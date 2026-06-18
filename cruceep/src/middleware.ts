import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Refreshes the Supabase auth session on every request so server components and
 * route handlers always see a valid, non-expired session. Without this, tokens
 * silently expire (~1h) and signed-in users get bounced to /login.
 *
 * No-ops when Supabase is not configured (mock mode), so local/offline dev is
 * unaffected.
 */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl()!,
    getSupabaseAnonKey()!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the user to trigger a token refresh + cookie rotation when needed.
  // Do not gate routing on the result here — page/route guards do that.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on app routes but skip static assets, the service worker, icons, and
  // PWA/SEO files so they are served without auth overhead.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|manifest.webmanifest|robots.txt|sitemap.xml|icons/).*)",
  ],
};
