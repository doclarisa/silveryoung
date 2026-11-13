// Choices and rules shared by the join form (browser) and the server checks.
// Keep these in step with the database checks in supabase/schema.sql.

export const SIZE_TYPES = [
  { value: "misses", label: "Misses (regular)" },
  { value: "petite", label: "Petite" },
  { value: "plus", label: "Plus (Women's)" },
  { value: "tall", label: "Tall" },
] as const;
export type SizeType = (typeof SIZE_TYPES)[number]["value"];

/** Numeric sizes offered in the form: 0, 2, 4 … 40. */
export const SIZE_NUMBERS = Array.from({ length: 21 }, (_, i) => i * 2);

export const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;
export type LetterSize = (typeof LETTER_SIZES)[number];

export const PHOTO_KINDS = [
  { value: "front", label: "Full length, from the front", hint: "Head to toe, standing naturally, arms relaxed." },
  { value: "side", label: "Full length, from the side", hint: "Turn sideways so brands can see how clothes fall." },
  { value: "closeup", label: "A smiling close-up", hint: "Head and shoulders. Just be yourself." },
] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number]["value"];

export const VISIBILITY = [
  { value: "public", label: "Public", hint: "Anyone can see it on your profile page." },
  { value: "brands", label: "Brands only", hint: "Only brands we work with can see it." },
] as const;
export type Visibility = (typeof VISIBILITY)[number]["value"];

export const MIN_AGE = 50;
export const OLDEST_BIRTH_YEAR = 1920;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // matches the storage bucket limit
export const PHOTO_BUCKET = "member-photos";

/** Height range the database accepts: 4 ft 0 in to 7 ft 6 in. */
export const MIN_HEIGHT_INCHES = 48;
export const MAX_HEIGHT_INCHES = 90;

export const ABOUT_MAX = 600;

/** The exact words saved with each member's consent. Change the version when the wording changes. */
export const CONSENT_TYPE = "photos_and_brand_sharing_v1";
export const CONSENT_TEXT =
  "I am 50 or older and these are photos of me. I agree that Silver Young Models may show my " +
  "first name, age, city and the photos I mark Public on its website, and may share my profile " +
  "and all my photos with clothing brands looking for models. I can change or delete my photos " +
  "and my profile at any time.";

export function ageFromBirthYear(birthYear: number, now = new Date()): number {
  return now.getFullYear() - birthYear;
}

export function latestBirthYear(now = new Date()): number {
  return now.getFullYear() - MIN_AGE;
}

export function formatHeight(inches: number): string {
  return `${Math.floor(inches / 12)} ft ${inches % 12} in`;
}

export function sizeTypeLabel(value: string): string {
  return SIZE_TYPES.find((s) => s.value === value)?.label ?? value;
}
