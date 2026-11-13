import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Runs before each page request and keeps the visitor's sign-in fresh
 * (Supabase login tokens expire hourly and are renewed here).
 * It does not decide who may see what: pages and the database do that.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!supabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Renews the session if needed. Do not put code between createServerClient and this call.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Skip static files, images and the Google verification file.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|google[0-9a-f]+\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
