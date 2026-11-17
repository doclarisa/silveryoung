"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { dictionaryFor } from "@/i18n/dictionaries";
import { defaultLocale, isLocale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import {
  ABOUT_MAX,
  CONSENT_TYPE,
  LETTER_SIZES,
  MAX_HEIGHT_INCHES,
  MIN_HEIGHT_INCHES,
  OLDEST_BIRTH_YEAR,
  PHOTO_BUCKET,
  PHOTO_KINDS,
  SIZE_NUMBERS,
  SIZE_TYPES,
  VISIBILITY,
  latestBirthYear,
} from "@/lib/member-options";

export type JoinPhoto = {
  kind: string;
  path: string;
  visibility: string;
  width: number;
  height: number;
};

export type JoinInput = {
  firstName: string;
  birthYear: number;
  city: string;
  state: string;
  heightInches: number;
  sizeType: string;
  sizeNumber: number;
  letterSize: string | null;
  aboutStyle: string;
  photos: JoinPhoto[];
  consent: boolean;
  /** Language of the form, for messages and the saved consent wording. */
  locale: string;
};

export type JoinResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): JoinResult => ({ ok: false, error });

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, max) : "";
}

/**
 * Saves a new member. Never trusts the browser: every field is checked again here,
 * and Row Level Security in the database checks once more.
 */
export async function submitJoin(input: JoinInput): Promise<JoinResult> {
  const t = dictionaryFor(isLocale(input?.locale) ? input.locale : defaultLocale);
  const e = t.join.errors;
  const user = await getCurrentUser();
  if (!user) return fail(e.signedOut);

  // --- Check every field ---------------------------------------------------
  const firstName = clean(input?.firstName, 40);
  const city = clean(input?.city, 60);
  const state = clean(input?.state, 40);
  const aboutStyle = typeof input?.aboutStyle === "string" ? input.aboutStyle.trim().slice(0, ABOUT_MAX) : "";
  const birthYear = Number(input?.birthYear);
  const heightInches = Number(input?.heightInches);
  const sizeNumber = Number(input?.sizeNumber);
  const sizeType = String(input?.sizeType ?? "");
  const letterSize = input?.letterSize ? String(input.letterSize) : null;

  if (!firstName) return fail(e.firstName);
  if (!Number.isInteger(birthYear) || birthYear < OLDEST_BIRTH_YEAR || birthYear > 2100) {
    return fail(e.birthYear);
  }
  if (birthYear > latestBirthYear()) return fail(e.tooYoung);
  if (!city) return fail(e.city);
  if (!state) return fail(e.state);
  if (!Number.isInteger(heightInches) || heightInches < MIN_HEIGHT_INCHES || heightInches > MAX_HEIGHT_INCHES) {
    return fail(e.height);
  }
  if (!SIZE_TYPES.some((s) => s.value === sizeType)) return fail(e.sizeType);
  if (!SIZE_NUMBERS.includes(sizeNumber)) return fail(e.size);
  if (letterSize !== null && !(LETTER_SIZES as readonly string[]).includes(letterSize)) {
    return fail(e.letterSize);
  }
  if (input?.consent !== true) return fail(e.consent);

  const photos = Array.isArray(input?.photos) ? input.photos : [];
  for (const kind of PHOTO_KINDS) {
    const matching = photos.filter((p) => p?.kind === kind.value);
    if (matching.length !== 1) return fail(fmt(e.photoMissing, { kind: t.options.photoKinds[kind.value].label.toLocaleLowerCase() }));
  }
  if (photos.length !== PHOTO_KINDS.length) return fail(e.photoCount);
  const prefix = `${user.id}/`;
  for (const p of photos) {
    if (typeof p.path !== "string" || !p.path.startsWith(prefix) || p.path.includes("..")) {
      return fail(e.photoBroken);
    }
    if (!VISIBILITY.some((v) => v.value === p.visibility)) {
      return fail(e.visibility);
    }
  }

  const supabase = await createClient();

  // --- Already joined? -----------------------------------------------------
  const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing) return fail(e.already);

  // --- The photo files must really be in this member's folder ---------------
  const { data: files, error: listError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list(user.id, { limit: 100 });
  if (listError) return fail(e.photoCheck);
  const uploaded = new Set((files ?? []).map((f) => `${user.id}/${f.name}`));
  if (!photos.every((p) => uploaded.has(p.path))) {
    return fail(e.photoUnfinished);
  }

  // --- Save ----------------------------------------------------------------
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, first_name: firstName, birth_year: birthYear, city, state });
  if (profileError) {
    console.error("join: profile insert failed", profileError);
    if (profileError.message.includes("50 or older")) return fail(e.tooYoung);
    return fail(e.save);
  }

  // If anything after this fails, remove the profile again (its details and
  // photo rows go with it) so the member can simply try again.
  const undo = async (logLabel: string, err: unknown): Promise<JoinResult> => {
    console.error(`join: ${logLabel} failed`, err);
    await supabase.from("profiles").delete().eq("id", user.id);
    return fail(e.save);
  };

  const { error: detailsError } = await supabase.from("member_details").insert({
    profile_id: user.id,
    height_inches: heightInches,
    size_type: sizeType,
    size_number: sizeNumber,
    letter_size: letterSize,
    about_style: aboutStyle || null,
  });
  if (detailsError) return undo("details insert", detailsError);

  const { error: photosError } = await supabase.from("photos").insert(
    PHOTO_KINDS.map((kind, i) => {
      const p = photos.find((x) => x.kind === kind.value)!;
      return {
        profile_id: user.id,
        kind: kind.value,
        storage_path: p.path,
        visibility: p.visibility,
        sort_order: i,
        width: Number.isInteger(p.width) ? p.width : null,
        height: Number.isInteger(p.height) ? p.height : null,
      };
    }),
  );
  if (photosError) return undo("photos insert", photosError);

  // Saves the exact words she agreed to, in her language. The time is set by the database.
  const { error: consentError } = await supabase
    .from("consents")
    .insert({ user_id: user.id, consent_type: CONSENT_TYPE, consent_text: t.join.consentText });
  if (consentError) return undo("consent insert", consentError);

  return { ok: true };
}
