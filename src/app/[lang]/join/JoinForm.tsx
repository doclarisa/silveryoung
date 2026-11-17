"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compressImage, PhotoError, type CompressedPhoto } from "@/lib/compress-image";
import { withTimeout } from "@/lib/with-timeout";
import { buttonClasses } from "@/components/ButtonLink";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import {
  ABOUT_MAX,
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

/** The parts of the dictionary this form needs (passed from the page, in the page's language). */
export type JoinText = {
  form: Dictionary["join"]["form"];
  consentText: string;
  photoErrors: Dictionary["join"]["photoErrors"];
  errors: Dictionary["join"]["errors"];
  options: Dictionary["options"];
};

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

/** Turns "Read our {privacy} and {terms}." into text with two links. */
function withLinks(text: string, links: Record<string, React.ReactNode>) {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return key && key in links ? <span key={i}>{links[key]}</span> : part;
  });
}

export function JoinForm({
  userId,
  currentYear,
  locale,
  t,
  links,
}: {
  userId: string;
  currentYear: number;
  locale: Locale;
  t: JoinText;
  links: { privacy: string; terms: string; account: string };
}) {
  const f = t.form;
  const kindLabel = (k: PhotoKind) => t.options.photoKinds[k].label;

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
        error: e instanceof PhotoError ? t.photoErrors[e.code] : t.photoErrors.generic,
      });
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    const form = new FormData(e.currentTarget);

    // Checks the browser can't do by itself.
    if (tooYoung) return setError(t.errors.tooYoung);
    const feet = Number(form.get("height_feet"));
    const inches = Number(form.get("height_inches"));
    const heightInches = feet * 12 + inches;
    if (heightInches < MIN_HEIGHT_INCHES || heightInches > MAX_HEIGHT_INCHES) {
      return setError(t.errors.height);
    }
    const missing = PHOTO_KINDS.filter((k) => !photos[k.value].photo);
    if (missing.length) {
      return setError(
        fmt(missing.length === 1 ? f.addPhoto : f.addPhotos, {
          list: missing.map((k) => kindLabel(k.value).toLocaleLowerCase(locale)).join("; "),
        }),
      );
    }

    const supabase = createClient();
    const uploadedPaths: string[] = [];
    try {
      const joinPhotos: JoinPhoto[] = [];
      for (const [i, kind] of PHOTO_KINDS.entries()) {
        setStatus(fmt(f.uploading, { n: i + 1, total: PHOTO_KINDS.length }));
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

      setStatus(f.saving);
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
          locale,
        }),
        30_000,
      );
      if (!result.ok) throw new FriendlyError(result.error);

      setStatus(f.done);
      router.replace(links.account);
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
            ? t.errors.connection
            : t.errors.generic,
      );
      setStatus(null);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-10" aria-describedby="join-required-note">
      <p id="join-required-note" className="text-lg text-muted">
        {f.requiredNote}
      </p>

      {/* ---------- About you ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>{f.aboutLegend}</legend>
        <div className="clear-both grid gap-6 pt-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClasses}>{f.firstName}</label>
            <p id="first_name_hint" className={hintClasses}>{f.firstNameHint}</p>
            <input id="first_name" name="first_name" required maxLength={40} autoComplete="given-name"
              aria-describedby="first_name_hint" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="birth_year" className={labelClasses}>{f.birthYear}</label>
            <p id="birth_year_hint" className={hintClasses}>{f.birthYearHint}</p>
            <input id="birth_year" name="birth_year" required inputMode="numeric" autoComplete="bday-year"
              pattern="\d{4}" maxLength={4} value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-describedby="birth_year_hint birth_year_check" aria-invalid={tooYoung || undefined}
              className={`${inputClasses} max-w-48`} />
            <p id="birth_year_check" aria-live="polite" className="mt-2 text-lg">
              {yearComplete && !tooYoung && year >= OLDEST_BIRTH_YEAR && fmt(f.ageWillShow, { age: currentYear - year })}
              {tooYoung && <strong className="text-plum">{fmt(f.tooYoungBorn, { year: latest })}</strong>}
            </p>
          </div>
          <div>
            <label htmlFor="city" className={labelClasses}>{f.city}</label>
            <input id="city" name="city" required maxLength={60} autoComplete="address-level2" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="state" className={labelClasses}>{f.state}</label>
            <input id="state" name="state" required maxLength={40} autoComplete="address-level1" className={inputClasses} />
          </div>
        </div>
      </fieldset>

      {/* ---------- Height and size ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>{f.sizeLegend}</legend>
        <p className={`clear-both pt-2 ${hintClasses}`}>{f.sizeIntro}</p>
        <div className="grid gap-6 pt-4 sm:grid-cols-2">
          <fieldset>
            <legend className={labelClasses}>{f.height}</legend>
            <div className="flex gap-4">
              <div>
                <label htmlFor="height_feet" className="mt-2 block text-lg">{f.feet}</label>
                <select id="height_feet" name="height_feet" required defaultValue="" className={`${inputClasses} mt-1 w-36`}>
                  <option value="" disabled>–</option>
                  {[4, 5, 6, 7].map((n) => <option key={n} value={n}>{fmt(f.feetOption, { n })}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="height_inches" className="mt-2 block text-lg">{f.inches}</label>
                <select id="height_inches" name="height_inches" required defaultValue="" className={`${inputClasses} mt-1 w-36`}>
                  <option value="" disabled>–</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{fmt(f.inchesOption, { n: i })}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
          <div>
            <label htmlFor="size_type" className={labelClasses}>{f.sizeType}</label>
            <select id="size_type" name="size_type" required defaultValue="" className={inputClasses}>
              <option value="" disabled>{f.chooseOne}</option>
              {SIZE_TYPES.map((s) => <option key={s.value} value={s.value}>{t.options.sizeTypes[s.value]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="size_number" className={labelClasses}>{f.size}</label>
            <p id="size_number_hint" className={hintClasses}>{f.sizeHint}</p>
            <select id="size_number" name="size_number" required defaultValue="" aria-describedby="size_number_hint" className={inputClasses}>
              <option value="" disabled>{f.chooseSize}</option>
              {SIZE_NUMBERS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="letter_size" className={labelClasses}>{f.letterSize}</label>
            <p id="letter_size_hint" className={hintClasses}>{f.letterSizeHint}</p>
            <select id="letter_size" name="letter_size" defaultValue="" aria-describedby="letter_size_hint" className={inputClasses}>
              <option value="">{f.notSure}</option>
              {LETTER_SIZES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-6">
          <label htmlFor="about_style" className={labelClasses}>{f.aboutStyle}</label>
          <p id="about_style_hint" className={hintClasses}>{f.aboutStyleHint}</p>
          <textarea id="about_style" name="about_style" rows={4} maxLength={ABOUT_MAX} value={about}
            onChange={(e) => setAbout(e.target.value)} aria-describedby="about_style_hint about_style_count"
            className={`${inputClasses} py-3`} />
          <p id="about_style_count" className="mt-1 text-base text-muted">{fmt(f.letterCount, { n: about.length, max: ABOUT_MAX })}</p>
        </div>
      </fieldset>

      {/* ---------- Photos ---------- */}
      <fieldset className={fieldsetClasses} disabled={busy}>
        <legend className={legendClasses}>{f.photosLegend}</legend>
        <p className={`clear-both pt-2 ${hintClasses}`}>{f.photosIntro}</p>
        <div className="grid gap-8 pt-6 lg:grid-cols-3">
          {PHOTO_KINDS.map((kind, i) => {
            const st = photos[kind.value];
            const inputId = `photo_${kind.value}`;
            return (
              <div key={kind.value} className="flex flex-col rounded-xl bg-paper p-5 ring-1 ring-silver-200">
                <p className="text-xl font-semibold">{i + 1}. {kindLabel(kind.value)}</p>
                <p className={hintClasses}>{t.options.photoKinds[kind.value].hint}</p>

                <div className="mt-4 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-silver-100">
                  {st.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local preview of the member's own photo
                    <img src={st.photo.previewUrl}
                      alt={fmt(f.yourPhotoAlt, { kind: kindLabel(kind.value).toLocaleLowerCase(locale) })}
                      className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-4 text-center text-lg text-muted">{st.working ? f.preparing : f.noPhoto}</span>
                  )}
                </div>

                <input id={inputId} type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { onPickPhoto(kind.value, e.target.files?.[0]); e.target.value = ""; }} />
                <label htmlFor={inputId}
                  className={buttonClasses("secondary", `mt-4 w-full cursor-pointer ${st.working ? "pointer-events-none opacity-60" : ""}`)}>
                  {st.photo ? f.changePhoto : f.choosePhoto}
                  <span className="sr-only">: {kindLabel(kind.value)}</span>
                </label>
                {st.error && <p role="alert" className="mt-3 rounded-lg bg-plum-50 p-3 text-lg text-plum-dark">{st.error}</p>}

                <fieldset className="mt-5">
                  <legend className="text-lg font-semibold">{f.whoCanSee}</legend>
                  {VISIBILITY.map((v) => (
                    <label key={v.value} className="mt-2 flex min-h-12 cursor-pointer items-start gap-3 text-lg">
                      <input type="radio" name={`visibility_${kind.value}`} value={v.value}
                        checked={st.visibility === v.value}
                        onChange={() => updatePhoto(kind.value, { visibility: v.value })}
                        className="mt-1.5 size-6 shrink-0 accent-plum" />
                      <span>
                        <strong>{t.options.visibility[v.value].label}</strong>
                        <br />
                        <span className="text-muted">{t.options.visibility[v.value].hint}</span>
                      </span>
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
        <legend className={legendClasses}>{f.consentLegend}</legend>
        <label className="clear-both flex cursor-pointer items-start gap-4 pt-4 text-lg">
          <input type="checkbox" name="consent" value="yes" required className="mt-1 size-7 shrink-0 accent-plum" />
          <span>{t.consentText}</span>
        </label>
        <p className="mt-4 text-lg">
          {withLinks(f.readOur, {
            privacy: <Link href={links.privacy} target="_blank" className="prose-link">{f.privacyLink}</Link>,
            terms: <Link href={links.terms} target="_blank" className="prose-link">{f.termsLink}</Link>,
          })}
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
          {busy ? f.pleaseWait : f.submit}
        </button>
        <p className="mt-3 text-lg text-muted">{f.afterJoin}</p>
      </div>
    </form>
  );
}
