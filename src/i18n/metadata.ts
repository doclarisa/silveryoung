import type { Metadata } from "next";
import { locales, lp, type Locale } from "./config";

/** Tells search engines where each language version of a page lives. */
export function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = { "x-default": lp("en", path) };
  for (const l of locales) languages[l] = lp(l, path);
  return { canonical: lp(locale, path), languages };
}
