"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage, PhotoError, type CompressedPhoto } from "@/lib/compress-image";
import { withTimeout } from "@/lib/with-timeout";
import { buttonClasses } from "@/components/ButtonLink";
import {
  ABOUT_MAX,
  CONSENT_TEXT,
  LETTER_SIZES,
  MAX_HEIGHT_INCHES,
  MAX_PHOTO_BYTES,
  MIN_HEIGHT_INCHES,
  OLDEST_BIRTH_YEAR,
  PHOTO_BUCKET,
  PHOTO_KINDS,
  SIZE_NUMBERS,
  SIZE_TYPES,
  VISIBILITY,
  MIN_AGE,
  type PhotoKind,
  type Visibility,
} from "@/lib/member-options";
import { submitJoin, type JoinPhoto } from "./actions";

const inputClasses =
  "mt-2 block w-full min-h-14 rounded-xl border-2 border-silver-300 bg-surface px-4 text-xl text-ink focus:border-plum focus:outline-none focus-visible:outline-3 focus-visible:outline-plum";
const labelClasses = "block text-xl font-semibold";
const hintClasses = "mt-1 text-lg text-muted";
const fieldsetClasses = "rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-silver-200 sm:p-8";
const legendClasses = "float-left w-full font-serif text-2xl font-semibold sm:text-3xl";

/** An error whose message was written for members and is safe to show. */
class FriendlyError extends Error {}

type PhotoState = {
  photo: CompressedPhoto | null;
  visibility: Visibility;
  working: boolean;
  error: string | null;
};

const emptyPhotos = (): Record<PhotoKind, PhotoState> => ({
  front: { photo: null, visibility: "public", working: false, error: null },
  side: { photo: null, visibility: "public", working: false, error: null },
  closeup: { photo: null, visibility: "public", working: false, error: null },
});

export function JoinForm({ userId, currentYear }: { userId: string; currentYear: number }) {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState(emptyPhotos);
  const [birthYear, setBirthYear] = useState("");
  const [about, setAbout] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = status !== null;

  // Free the photo previews when leaving the page.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => {
      Object.values(photosRef.current).forEach((p) => p.photo && URL.revokeObjectURL(p.photo.previewUrl));
    },
    [],
  );

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  // The year comes from the server, so this page never reads the clock while it is being built.
  const latest = currentYear - MIN_AGE;
  const year = Number(birthYear);
  const yearComplete = /^\d{4}$/.test(birthYear);
  const tooYoung = yearComplete && year > latest;

  function updatePhoto(kind: PhotoKind, patch: Partial<PhotoState>) {
    setPhotos((prev) => ({ ...prev, [kind]: { ...prev[kind], ...patch } }));
  }

  async function onPickPhoto(kind: PhotoKind, file: File | undefined) {
    if (!file) return;
    updatePhoto(kind, { working: true, error: null });
    try {
      const compressed = await compressImage(file, MAX_PHOTO_BYTES);
      const old = photos[kind].photo;
      if (old) URL.revokeObjectURL(old.previewUrl);
      updatePhoto(kind, { photo: compressed, working: false });
      setError(null); // a "please add photos" message is now out of date
    } catch (e) {
      console.error("photo prepare failed", e);
      updatePhoto(kind, {
        working: false,
        error: e instanceof PhotoError ? e.message : "We couldn't use that photo. Please try another one.",
      });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const form = new FormData(e.currentTarget);

    // Checks the browser can't do by itself.
    if (tooYoung) return setError("Members must be 50 or older.");
    const feet = Number(form.get("height_feet"));
    const inches = Number(form.get("height_inches"));
    const heightInches = feet * 12 + inches;
    if (heightInches < MIN_HEIGHT_INCHES || heightInches > MAX_HEIGHT_INCHES) {
      return setError("Please choose your height.");
    }
    const missing = PHOTO_KINDS.filter((k) => !photos[k.value].photo);
    if (missing.length) {
      return setError(
        `Please add ${missing.length === 1 ? "this photo" : "these photos"}: ${missing
          .map((k) => k.label.toLowerCase())
          .join("; ")}.`,
      );
    }

    const supabase = createClient();
    const uploadedPaths: string[] = [];
    try {
      const joinPhotos: JoinPhoto[] = [];
      for (const [i, kind] of PHOTO_KINDS.entries()) {
        setStatus(`Uploading photo ${i + 1} of ${PHOTO_KINDS.length}…`);
        const state = photos[kind.value];
        const path = `${userId}/${kind.value}-${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await withTimeout(
          supabase.storage
            .from(PHOTO_BUCKET)
            .upload(path, state.photo!.blob, { contentType: "image/jpeg", upsert: false }),
          90_000,
        );
        if (upErr) throw upErr;
        uploadedPaths.push(path);
        joinPhotos.push({
          kind: kind.value,
          path,
          visibility: state.visibility,
          width: state.photo!.width,
          height: state.photo!.height,
        });
      }

      setStatus("Saving your profile…");
      const letter = String(form.get("letter_size") ?? "");
      const result = await withTimeout(
        submitJoin({
          firstName: String(form.get("first_name") ?? ""),
          birthYear: year,
          city: String(form.get("city") ?? ""),
          state: String(form.get("state") ?? ""),
          heightInches,
          sizeType: String(form.get("size_type") ?? ""),
          sizeNumber: Number(form.get("size_number")),
          letterSize: letter || null,
          aboutStyle: about,
          photos: joinPhotos,
          consent: form.get("consent") === "yes",
        }),
        30_000,
      );
      if (!result.ok) throw new FriendlyError(result.error);

      setStatus("Done! Taking you to your account…");
      router.replace("/account?welcome=1");
      router.refresh();
    } catch (err) {
      console.error("join failed", err);
      if (uploadedPaths.length) {
        // Tidy up so no stray photos are left behind.
        await supabase.storage.from(PHOTO_BUCKET).remove(uploadedPaths).catch(() => {});
      }
      const msg = err instanceof Error ? err.message : "";
      setError(
        err instanceof FriendlyError
          ? msg
          : msg === "timeout" || /fetch|network/i.test(msg)
            ? "The connection is slow or was lost. Please check your internet and press Join again."
            : "Something went wrong while saving. Please press Join again.",
      );
      setStatus(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-10" aria-describedby="join-required-note">
      <p id="join-required-note" className="text-lg text-muted">
        Everything is required unless it says &ldquo;optional&rdquo;.
      </p>

      {/* ---------- About you ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>1. About you</legend>
        <div className="clear-both grid gap-6 pt-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClasses}>First name</label>
            <p id="first_name_hint" className={hintClasses}>Shown on your profile. We never show your last name.</p>
            <input id="first_name" name="first_name" required maxLength={40} autoComplete="given-name"
              aria-describedby="first_name_hint" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="birth_year" className={labelClasses}>Birth year</label>
            <p id="birth_year_hint" className={hintClasses}>For example 1962. We show your age, never your birthday.</p>
            <input id="birth_year" name="birth_year" required inputMode="numeric" autoComplete="bday-year"
              pattern="\d{4}" maxLength={4} value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-describedby="birth_year_hint birth_year_check" aria-invalid={tooYoung || undefined}
              className={`${inputClasses} max-w-48`} />
            <p id="birth_year_check" aria-live="polite" className="mt-2 text-lg">
              {yearComplete && !tooYoung && year >= OLDEST_BIRTH_YEAR && <>Your age will show as <strong>{currentYear - year}</strong>.</>}
              {tooYoung && <strong className="text-plum">Members must be 50 or older (born {latest} or earlier).</strong>}
            </p>
          </div>
          <div>
            <label htmlFor="city" className={labelClasses}>City</label>
            <input id="city" name="city" required maxLength={60} autoComplete="address-level2" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="state" className={labelClasses}>State</label>
            <input id="state" name="state" required maxLength={40} autoComplete="address-level1" className={inputClasses} />
          </div>
        </div>
      </fieldset>

      {/* ---------- Height and size ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>2. Height and size</legend>
        <p className={`clear-both pt-2 ${hintClasses}`}>
          Only brands see these, so they can find the right person for their clothes.
        </p>
        <div className="grid gap-6 pt-4 sm:grid-cols-2">
          <fieldset>
            <legend className={labelClasses}>Height</legend>
            <div className="flex gap-4">
              <div>
                <label htmlFor="height_feet" className="mt-2 block text-lg">Feet</label>
                <select id="height_feet" name="height_feet" required defaultValue="" className={`${inputClasses} mt-1 w-28`}>
                  <option value="" disabled>–</option>
                  {[4, 5, 6, 7].map((f) => <option key={f} value={f}>{f} ft</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="height_inches" className="mt-2 block text-lg">Inches</label>
                <select id="height_inches" name="height_inches" required defaultValue="" className={`${inputClasses} mt-1 w-28`}>
                  <option value="" disabled>–</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i} in</option>)}
                </select>
              </div>
            </div>
          </fieldset>
          <div>
            <label htmlFor="size_type" className={labelClasses}>Size type</label>
            <select id="size_type" name="size_type" required defaultValue="" className={inputClasses}>
              <option value="" disabled>Choose one</option>
              {SIZE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="size_number" className={labelClasses}>Size</label>
            <p id="size_number_hint" className={hintClasses}>Your usual dress or pants size.</p>
            <select id="size_number" name="size_number" required defaultValue="" aria-describedby="size_number_hint" className={inputClasses}>
              <option value="" disabled>Choose a size</option>
              {SIZE_NUMBERS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="letter_size" className={labelClasses}>Letter size (optional)</label>
            <p id="letter_size_hint" className={hintClasses}>For tops, if you know it.</p>
            <select id="letter_size" name="letter_size" defaultValue="" aria-describedby="letter_size_hint" className={inputClasses}>
              <option value="">I&rsquo;m not sure</option>
              {LETTER_SIZES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-6">
          <label htmlFor="about_style" className={labelClasses}>Your style in a few words (optional)</label>
          <p id="about_style_hint" className={hintClasses}>For example: &ldquo;Classic with a pop of color. I love scarves.&rdquo;</p>
          <textarea id="about_style" name="about_style" rows={4} maxLength={ABOUT_MAX} value={about}
            onChange={(e) => setAbout(e.target.value)} aria-describedby="about_style_hint about_style_count"
            className={`${inputClasses} py-3`} />
          <p id="about_style_count" className="mt-1 text-base text-muted">{about.length} of {ABOUT_MAX} letters</p>
        </div>
      </fieldset>

      {/* ---------- Photos ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>3. Your three photos</legend>
        <p className={`clear-both pt-2 ${hintClasses}`}>
          From your phone or computer. Large photos are fine; we shrink them for you. For each one, choose who can see it.
        </p>
        <div className="grid gap-8 pt-6 lg:grid-cols-3">
          {PHOTO_KINDS.map((kind, i) => {
            const st = photos[kind.value];
            const inputId = `photo_${kind.value}`;
            return (
              <div key={kind.value} className="flex flex-col rounded-xl bg-paper p-5 ring-1 ring-silver-200">
                <p className="text-xl font-semibold">{i + 1}. {kind.label}</p>
                <p className={hintClasses}>{kind.hint}</p>

                <div className="mt-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-silver-100">
                  {st.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local preview of the member's own photo
                    <img src={st.photo.previewUrl} alt={`Your photo: ${kind.label.toLowerCase()}`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-4 text-center text-lg text-muted">{st.working ? "Preparing photo…" : "No photo yet"}</span>
                  )}
                </div>

                <input id={inputId} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { onPickPhoto(kind.value, e.target.files?.[0]); e.target.value = ""; }} />
                <label htmlFor={inputId}
                  className={buttonClasses("secondary", `mt-4 w-full cursor-pointer ${st.working ? "pointer-events-none opacity-60" : ""}`)}>
                  {st.photo ? "Change photo" : "Choose photo"}
                  <span className="sr-only">: {kind.label}</span>
                </label>
                {st.error && <p role="alert" className="mt-3 rounded-lg bg-plum-50 p-3 text-lg text-plum-dark">{st.error}</p>}

                <fieldset className="mt-5">
                  <legend className="text-lg font-semibold">Who can see this photo?</legend>
                  {VISIBILITY.map((v) => (
                    <label key={v.value} className="mt-2 flex min-h-12 cursor-pointer items-start gap-3 text-lg">
                      <input type="radio" name={`visibility_${kind.value}`} value={v.value}
                        checked={st.visibility === v.value}
                        onChange={() => updatePhoto(kind.value, { visibility: v.value })}
                        className="mt-1.5 size-6 shrink-0 accent-plum" />
                      <span><strong>{v.label}</strong><br /><span className="text-muted">{v.hint}</span></span>
                    </label>
                  ))}
                </fieldset>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* ---------- Consent ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>4. Your permission</legend>
        <label className="clear-both flex cursor-pointer items-start gap-4 pt-4 text-lg">
          <input type="checkbox" name="consent" value="yes" required className="mt-1 size-7 shrink-0 accent-plum" />
          <span>{CONSENT_TEXT}</span>
        </label>
        <p className="mt-4 text-lg">
          Read our <Link href="/privacy" target="_blank" className="prose-link">Privacy Policy</Link> and{" "}
          <Link href="/terms" target="_blank" className="prose-link">Terms</Link> (open in a new tab).
        </p>
      </fieldset>

      {error && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-xl border-2 border-plum bg-plum-50 p-5 text-lg">
          {error}
        </div>
      )}
      {status && (
        <p role="status" className="rounded-xl bg-silver-100 p-5 text-lg font-semibold">{status}</p>
      )}

      <div>
        <button type="submit" disabled={busy} className={buttonClasses("primary", "w-full sm:w-auto disabled:opacity-60")}>
          {busy ? "Please wait…" : "Join Silver Young Models"}
        </button>
        <p className="mt-3 text-lg text-muted">
          After you join, we look at every new profile before it appears on the site. This usually takes a day or two.
        </p>
      </div>
    </form>
  );
}
