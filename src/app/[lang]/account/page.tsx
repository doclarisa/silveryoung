import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ButtonLink, buttonClasses } from "@/components/ButtonLink";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile, type MyProfile } from "@/lib/members";
import { signOut } from "@/lib/actions/auth";
import { ageFromBirthYear, formatHeight } from "@/lib/member-options";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.account.title, robots: { index: false } };
}

export default async function AccountPage({ searchParams }: PageProps<"/[lang]/account">) {
  const { t } = await getI18n();
  return (
    <PageShell title={t.account.title}>
      <Suspense fallback={<p>{t.common.loading}</p>}>
        <AccountDetails searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

async function AccountDetails({ searchParams }: { searchParams: PageProps<"/[lang]/account">["searchParams"] }) {
  const { t, href } = await getI18n();
  const user = await getCurrentUser();
  if (!user) redirect(href(`/login?next=${encodeURIComponent(href("/account"))}`));
  const [profile, params] = await Promise.all([getMyProfile(user.id), searchParams]);
  const welcome = params.welcome === "1";
  const a = t.account;

  return (
    <>
      {welcome && profile && (
        <div role="status" className="rounded-2xl border-2 border-plum bg-plum-50 p-6">
          <p className="text-2xl font-semibold">{fmt(a.welcomeTitle, { name: profile.first_name })}</p>
          <p className="mt-1">{a.welcomeText}</p>
        </div>
      )}

      <p>{fmt(a.signedInAs, { email: user.email })}</p>

      {profile ? (
        <ProfileSummary profile={profile} t={t} />
      ) : (
        <div className="rounded-2xl bg-silver-100 p-6">
          <p className="text-xl font-semibold">{a.notJoinedTitle}</p>
          <p className="mt-1">{a.notJoinedText}</p>
          <ButtonLink href={href("/join")} className="mt-5">
            {a.finishJoining}
          </ButtonLink>
        </div>
      )}

      {/* Step 5 adds editing, photo visibility changes and account deletion. */}
      <form action={signOut} className="pt-4">
        <button type="submit" className={buttonClasses("secondary")}>
          {t.common.signOut}
        </button>
      </form>
    </>
  );
}

function ProfileSummary({ profile, t }: { profile: MyProfile; t: Dictionary }) {
  const a = t.account;
  const s = a.status[profile.status];
  const d = profile.details;
  const rows: [string, string][] = [
    [a.firstName, profile.first_name],
    [a.age, String(ageFromBirthYear(profile.birth_year))],
    [a.city, `${profile.city}, ${profile.state}`],
  ];
  if (d) {
    const sizeType = t.options.sizeTypes[d.size_type as keyof Dictionary["options"]["sizeTypes"]] ?? d.size_type;
    rows.push(
      [a.height, formatHeight(d.height_inches, t.options.heightValue)],
      [a.size, fmt(a.sizeValue, { type: sizeType, n: d.size_number }) + (d.letter_size ? ` (${d.letter_size})` : "")],
    );
    if (d.about_style) rows.push([a.myStyle, d.about_style]);
  }
  const kinds = t.options.photoKinds as Record<string, { label: string }>;
  const vis = t.options.visibility as Record<string, { label: string }>;

  return (
    <>
      <section aria-labelledby="status-heading" className="rounded-2xl bg-surface p-6 ring-1 ring-silver-200">
        <h2 id="status-heading" className="mt-0! text-2xl font-semibold">
          {fmt(a.statusHeading, { status: s.title })}
        </h2>
        <p className="mt-1">{s.text}</p>
      </section>

      <section aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-2xl font-semibold">{a.detailsHeading}</h2>
        <dl className="mt-3 divide-y divide-silver-200 rounded-2xl bg-surface ring-1 ring-silver-200">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]">
              <dt className="font-semibold">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-base text-muted">{a.privateNote}</p>
      </section>

      <section aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="text-2xl font-semibold">{a.photosHeading}</h2>
        <ul className="mt-3 grid gap-6 sm:grid-cols-3">
          {profile.photos.map((p) => {
            const kind = kinds[p.kind]?.label ?? p.kind;
            return (
              <li key={p.id} className="overflow-hidden rounded-xl bg-surface ring-1 ring-silver-200">
                <div className="aspect-[3/4] bg-silver-100">
                  {p.url && (
                    // eslint-disable-next-line @next/next/no-img-element -- private signed link, not optimizable
                    <img
                      src={p.url}
                      alt={fmt(t.join.form.yourPhotoAlt, { kind: kind.toLocaleLowerCase() })}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold">{kind}</p>
                  <p className="text-muted">
                    {a.whoCanSee} <strong className="text-ink">{vis[p.visibility]?.label ?? p.visibility}</strong>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
