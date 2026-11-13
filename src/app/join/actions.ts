"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  ABOUT_MAX,
  CONSENT_TEXT,
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
  const user = await getCurrentUser();
  if (!user) return fail("Your sign-in has expired. Please sign in again, then fill in the form.");

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

  if (!firstName) return fail("Please enter your first name.");
  if (!Number.isInteger(birthYear) || birthYear < OLDEST_BIRTH_YEAR || birthYear > 2100) {
    return fail("Please enter your birth year as four numbers, for example 1962.");
  }
  if (birthYear > latestBirthYear()) return fail("Members must be 50 or older.");
  if (!city) return fail("Please enter your city.");
  if (!state) return fail("Please enter your state.");
  if (!Number.isInteger(heightInches) || heightInches < MIN_HEIGHT_INCHES || heightInches > MAX_HEIGHT_INCHES) {
    return fail("Please choose your height.");
  }
  if (!SIZE_TYPES.some((s) => s.value === sizeType)) return fail("Please choose your size type.");
  if (!SIZE_NUMBERS.includes(sizeNumber)) return fail("Please choose your size.");
  if (letterSize !== null && !(LETTER_SIZES as readonly string[]).includes(letterSize)) {
    return fail("Please choose a letter size from the list, or leave it empty.");
  }
  if (input?.consent !== true) return fail("Please tick the box to agree before joining.");

  const photos = Array.isArray(input?.photos) ? input.photos : [];
  for (const kind of PHOTO_KINDS) {
    const matching = photos.filter((p) => p?.kind === kind.value);
    if (matching.length !== 1) return fail(`Please add your photo: ${kind.label.toLowerCase()}.`);
  }
  if (photos.length !== PHOTO_KINDS.length) return fail("Please add exactly three photos.");
  const prefix = `${user.id}/`;
  for (const p of photos) {
    if (typeof p.path !== "string" || !p.path.startsWith(prefix) || p.path.includes("..")) {
      return fail("Something went wrong with your photos. Please add them again.");
    }
    if (!VISIBILITY.some((v) => v.value === p.visibility)) {
      return fail("Please choose Public or Brands only for each photo.");
    }
  }

  const supabase = await createClient();

  // --- Already joined? -----------------------------------------------------
  const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (existing) return fail("You have already joined. Go to My account to see your profile.");

  // --- The photo files must really be in this member's folder ---------------
  const { data: files, error: listError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .list(user.id, { limit: 100 });
  if (listError) return fail("We couldn't check your photos. Please try again.");
  const uploaded = new Set((files ?? []).map((f) => `${user.id}/${f.name}`));
  if (!photos.every((p) => uploaded.has(p.path))) {
    return fail("One of your photos didn't finish uploading. Please try again.");
  }

  // --- Save ----------------------------------------------------------------
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, first_name: firstName, birth_year: birthYear, city, state });
  if (profileError) {
    console.error("join: profile insert failed", profileError);
    if (profileError.message.includes("50 or older")) return fail("Members must be 50 or older.");
    return fail("We couldn't save your profile. Please try again in a moment.");
  }

  // If anything after this fails, remove the profile again (its details and
  // photo rows go with it) so the member can simply try again.
  const undo = async (logLabel: string, err: unknown): Promise<JoinResult> => {
    console.error(`join: ${logLabel} failed`, err);
    await supabase.from("profiles").delete().eq("id", user.id);
    return fail("We couldn't save your profile. Please try again in a moment.");
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

  // The time of agreement is set by the database, not by the browser.
  const { error: consentError } = await supabase
    .from("consents")
    .insert({ user_id: user.id, consent_type: CONSENT_TYPE, consent_text: CONSENT_TEXT });
  if (consentError) return undo("consent insert", consentError);

  return { ok: true };
}
