import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";
import { PHOTO_BUCKET, PHOTO_KINDS, ageFromBirthYear } from "@/lib/member-options";

/*
 * What any visitor may see: approved members' first name, age, city/state and
 * their PUBLIC photos. Read as an anonymous visitor, so the database rules
 * (RLS) decide — never the website code alone.
 *
 * Caching: pages using this are cached and refreshed in the background.
 *   - refreshed at most every hour (revalidate), and
 *   - never shown more than 1 day old (expire) + 5 min in a browser (stale).
 * Photo links are signed for 7 days, far longer than any cached page can live,
 * so a cached page never shows a broken photo.
 * Changes (approve, hide, edit, delete) should call updateTag(MEMBERS_TAG).
 */
export const MEMBERS_TAG = "members";
export const memberTag = (id: string) => `member:${id}`;

const CACHE = { stale: 300, revalidate: 3600, expire: 86400 } as const;
const SIGNED_URL_SECONDS = 7 * 24 * 3600;
// Guard: links must outlive the longest a cached page can be shown.
if (SIGNED_URL_SECONDS <= CACHE.expire + CACHE.stale) throw new Error("Signed photo links must outlive the page cache");

export type PublicPhoto = { kind: string; url: string; width: number | null; height: number | null };
export type PublicMember = {
  id: string;
  firstName: string;
  age: number;
  city: string;
  state: string;
  photos: PublicPhoto[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function anonClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type Row = {
  id: string;
  first_name: string;
  birth_year: number;
  city: string;
  state: string;
  photos: { kind: string; storage_path: string; width: number | null; height: number | null; sort_order: number }[];
};

async function toMembers(rows: Row[]): Promise<PublicMember[]> {
  const supabase = anonClient();
  const paths = rows.flatMap((r) => r.photos.map((p) => p.storage_path));
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
    if (error) console.error("public photos: signing failed", error);
    data?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }
  return rows.map((r) => ({
    id: r.id,
    firstName: r.first_name,
    age: ageFromBirthYear(r.birth_year),
    city: r.city,
    state: r.state,
    photos: [...r.photos]
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((p) => {
        const url = urls.get(p.storage_path);
        return url ? [{ kind: p.kind, url, width: p.width, height: p.height }] : [];
      }),
  }));
}

const SELECT = "id, first_name, birth_year, city, state, photos(kind, storage_path, width, height, sort_order)";

/** Newest approved members first, for the homepage. */
export async function getFoundingMembers(limit = 12): Promise<PublicMember[]> {
  "use cache";
  cacheLife(CACHE);
  cacheTag(MEMBERS_TAG);
  if (!supabaseConfigured) return [];

  const { data, error } = await anonClient()
    .from("profiles")
    .select(SELECT)
    .eq("status", "approved")
    .eq("photos.visibility", "public")
    .order("approved_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getFoundingMembers failed", error);
    return [];
  }
  return toMembers((data ?? []) as Row[]);
}

/** One approved member's public page data, or null. */
export async function getPublicMember(id: string): Promise<PublicMember | null> {
  "use cache";
  cacheLife(CACHE);
  cacheTag(MEMBERS_TAG, memberTag(id));
  if (!supabaseConfigured || !UUID.test(id)) return null;

  const { data, error } = await anonClient()
    .from("profiles")
    .select(SELECT)
    .eq("id", id)
    .eq("status", "approved")
    .eq("photos.visibility", "public")
    .maybeSingle();
  if (error) {
    console.error("getPublicMember failed", error);
    return null;
  }
  if (!data) return null;
  const [member] = await toMembers([data as Row]);
  return member;
}

/** Ids of approved members, so their pages can be built ahead of time. */
export async function getApprovedMemberIds(): Promise<string[]> {
  "use cache";
  cacheLife(CACHE);
  cacheTag(MEMBERS_TAG);
  if (!supabaseConfigured) return [];
  const { data } = await anonClient().from("profiles").select("id").eq("status", "approved").limit(200);
  return (data ?? []).map((r) => r.id as string);
}

/** The best photo for a small tile: the close-up if public, else the first public one. */
export function tilePhoto(m: PublicMember): PublicPhoto | null {
  return m.photos.find((p) => p.kind === "closeup") ?? m.photos[0] ?? null;
}

export function photoAlt(m: PublicMember, kind: string): string {
  const label = PHOTO_KINDS.find((k) => k.value === kind)?.label.toLowerCase() ?? "photo";
  return `${m.firstName}, ${m.age}, from ${m.city}: ${label}`;
}
