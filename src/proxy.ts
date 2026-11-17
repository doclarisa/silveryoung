import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Runs before each page request.
 *
 * 1. Language. English pages keep plain addresses (/join); Russian and Greek
 *    have a prefix (/ru/join, /el/join). Internally every page lives under
 *    /[lang]/…, so plain addresses are quietly served from /en/….
 *    The chosen language is remembered in a cookie: someone who picked Russian
 *    and later opens silveryoungmodels.com goes straight to the Russian site.
 *    /en/… links (used by the language switch) set English and drop the prefix.
 *
 * 2. Sign-in. Keeps the visitor's Supabase login fresh (tokens expire hourly).
 *    It does not decide who may see what: pages and the database do that.
 */
const YEAR = 60 * 60 * 24 * 365;

function rememberLocale(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR, sameSite: "lax" });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const prefix = pathname.match(/^\/(en|ru|el)(?=\/|$)/)?.[1] as Locale | undefined;
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;

  // Sign-in links and other non-page routes: no language handling.
  const isPage = !pathname.startsWith("/auth/") && !pathname.startsWith("/api/");

  if (isPage && prefix === "en") {
    // /en/join → /join, and remember English.
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return rememberLocale(NextResponse.redirect(url), "en");
  }

  if (isPage && !prefix && isLocale(saved) && saved !== defaultLocale) {
    // Plain address, but this visitor chose Russian or Greek before.
    const url = request.nextUrl.clone();
    url.pathname = `/${saved}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Serve the page: plain addresses come from the English folder.
  const rewriteTo = isPage && !prefix ? new URL(`/en${pathname}${search}`, request.url) : null;
  const makeResponse = () =>
    rewriteTo ? NextResponse.rewrite(rewriteTo, { request }) : NextResponse.next({ request });

  let response = makeResponse();
  const finish = (res: NextResponse) =>
    prefix && prefix !== saved ? rememberLocale(res, prefix) : res;

  if (!supabaseConfigured) return finish(response);

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = makeResponse();
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Renews the session if needed. Do not put code between createServerClient and this call.
  await supabase.auth.getClaims();

  return finish(response);
}

export const config = {
  // Skip Next.js files, images, icons and the Google verification file.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|google[0-9a-f]+\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|mp4)$).*)",
  ],
};
