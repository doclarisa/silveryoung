import type { Locale } from "../config";
import en, { type Dictionary } from "./en";
import ru from "./ru";
import el from "./el";

export type { Dictionary };

// All three are small, so they are simply bundled (server-side only, unless a
// page passes a part of one to a form in the browser).
const dictionaries: Record<Locale, Dictionary> = { en, ru, el };

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}
