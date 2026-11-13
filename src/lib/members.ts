import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PHOTO_BUCKET } from "@/lib/member-options";

export type MyProfile = {
  first_name: string;
  birth_year: number;
  city: string;
  state: string;
  status: "pending" | "approved" | "hidden";
  details: {
    height_inches: number;
    size_type: string;
    size_number: number;
    letter_size: string | null;
    about_style: string | null;
  } | null;
  photos: { id: string; kind: string; visibility: string; storage_path: string; url: string | null }[];
};

/** The signed-in member's own profile with short-lived photo links, or null if they haven't joined. */
export async function getMyProfile(userId: string): Promise<MyProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "first_name, birth_year, city, state, status, " +
        "member_details(height_inches, size_type, size_number, letter_size, about_style), " +
        "photos(id, kind, visibility, storage_path, sort_order)",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("getMyProfile failed", error);
    throw new Error("Could not load your profile.");
  }
  if (!data) return null;

  type Row = Omit<MyProfile, "details" | "photos"> & {
    member_details: MyProfile["details"] | MyProfile["details"][];
    photos: { id: string; kind: string; visibility: string; storage_path: string; sort_order: number }[];
  };
  const row = data as unknown as Row;
  const photos = [...(row.photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  // This page is never cached, so a 1-hour link is plenty.
  const urls = new Map<string, string>();
  if (photos.length) {
    const { data: signed } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrls(photos.map((p) => p.storage_path), 60 * 60);
    signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }

  return {
    first_name: row.first_name,
    birth_year: row.birth_year,
    city: row.city,
    state: row.state,
    status: row.status,
    details: Array.isArray(row.member_details) ? (row.member_details[0] ?? null) : row.member_details,
    photos: photos.map((p) => ({ ...p, url: urls.get(p.storage_path) ?? null })),
  };
}
