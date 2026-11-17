// Languages of the site. English is the default and keeps the plain addresses
// (/join); the others get a prefix (/ru/join, /el/join).
export const locales = ["en", "ru", "el"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that remembers the visitor's chosen language. */
export const LOCALE_COOKIE = "lang";

export const localeNames: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  ru: { short: "RU", name: "Русский" },
  el: { short: "EL", name: "Ελληνικά" },
};

/** For Open Graph and number/date formatting. */
export const localeRegion: Record<Locale, string> = { en: "en_US", ru: "ru_RU", el: "el_GR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Address of a page in a language: lp("ru", "/join") → "/ru/join"; lp("en", "/join") → "/join". */
export function lp(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Splits "/ru/join?x=1" into { locale: "ru", path: "/join?x=1" }. Plain paths are English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(en|ru|el)(?=\/|\?|#|$)(.*)$/);
  if (!m) return { locale: defaultLocale, path: pathname || "/" };
  return { locale: m[1] as Locale, path: m[2] || "/" };
}
