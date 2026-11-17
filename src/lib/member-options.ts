// Choices and rules shared by the join form (browser) and the server checks.
// Keep these in step with the database checks in supabase/schema.sql.

// Words for these choices live in src/i18n/dictionaries (options.*).
export const SIZE_TYPES = [{ value: "misses" }, { value: "petite" }, { value: "plus" }, { value: "tall" }] as const;
export type SizeType = (typeof SIZE_TYPES)[number]["value"];

/** Numeric sizes offered in the form: 0, 2, 4 … 40. */
export const SIZE_NUMBERS = Array.from({ length: 21 }, (_, i) => i * 2);

export const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type LetterSize = (typeof LETTER_SIZES)[number];

export const PHOTO_KINDS = [{ value: "front" }, { value: "side" }, { value: "closeup" }] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number]["value"];

export const VISIBILITY = [{ value: "public" }, { value: "brands" }] as const;
export type Visibility = (typeof VISIBILITY)[number]["value"];

export const MIN_AGE = 50;
export const OLDEST_BIRTH_YEAR = 1920;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // matches the storage bucket limit
export const PHOTO_BUCKET = "member-photos";

/** Height range the database accepts: 4 ft 0 in to 7 ft 6 in. */
export const MIN_HEIGHT_INCHES = 48;
export const MAX_HEIGHT_INCHES = 90;

export const ABOUT_MAX = 600;

/**
 * Saved with each member's consent, together with the exact words she saw
 * (join.consentText in her language). Change the version when the wording changes.
 */
export const CONSENT_TYPE = "photos_and_brand_sharing_v1";

export function ageFromBirthYear(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function latestBirthYear(now = new Date()): number {
  return now.getFullYear() - MIN_AGE;
}

/** template is options.heightValue from the dictionary, e.g. "{ft} ft {in} in". */
export function formatHeight(inches: number, template: string): string {
  return template.replace("{ft}", String(Math.floor(inches / 12))).replace("{in}", String(inches % 12));
}
