import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, lp, type Locale } from "./config";
import { dictionaryFor, type Dictionary } from "./dictionaries";

/** The language of the page being rendered (from the address: /ru/…, /el/…, or English). */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** Text for the current page's language, plus a helper for links in that language. */
export async function getI18n(): Promise<{ locale: Locale; t: Dictionary; href: (path: string) => string }> {
  const locale = await getLocale();
  return { locale, t: dictionaryFor(locale), href: (path) => lp(locale, path) };
}
