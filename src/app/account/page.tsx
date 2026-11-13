import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { ButtonLink, buttonClasses } from "@/components/ButtonLink";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile, type MyProfile } from "@/lib/members";
import { signOut } from "@/app/actions/auth";
import {
  PHOTO_KINDS,
  VISIBILITY,
  ageFromBirthYear,
  formatHeight,
  sizeTypeLabel,
} from "@/lib/member-options";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <PageShell title="My account">
      <Suspense fallback={<p>Loading your account…</p>}>
        <AccountDetails searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

const statusText: Record<MyProfile["status"], { title: string; text: string }> = {
  pending: {
    title: "Waiting for review",
    text: "We look at every new profile before it appears on the site. This usually takes a day or two. We'll email you when you're live.",
  },
  approved: {
    title: "Live on the site",
    text: "Your profile and your Public photos can be seen on Silver Young Models.",
  },
  hidden: {
    title: "Hidden",
    text: "Your profile is not shown on the site right now. Contact us if you have questions.",
  },
};

async function AccountDetails({ searchParams }: { searchParams: PageProps<"/account">["searchParams"] }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const [profile, params] = await Promise.all([getMyProfile(user.id), searchParams]);
  const welcome = params.welcome === "1";

  return (
    <>
      {welcome && profile && (
        <div role="status" className="rounded-2xl border-2 border-plum bg-plum-50 p-6">
          <p className="text-2xl font-semibold">Welcome, {profile.first_name}! You&rsquo;ve joined.</p>
          <p className="mt-1">Thank you for being one of our Founding Members.</p>
        </div>
      )}

      <p>
        You are signed in as <strong>{user.email}</strong>.
      </p>

      {profile ? (
        <ProfileSummary profile={profile} />
      ) : (
        <div className="rounded-2xl bg-silver-100 p-6">
          <p className="text-xl font-semibold">You haven&rsquo;t finished joining yet.</p>
          <p className="mt-1">Add your details and three photos to become a Founding Member.</p>
          <ButtonLink href="/join" className="mt-5">Finish joining</ButtonLink>
        </div>
      )}

      {/* Step 5 adds editing, photo visibility changes and account deletion. */}
      <form action={signOut} className="pt-4">
        <button type="submit" className={buttonClasses("secondary")}>
          Sign out
        </button>
      </form>
    </>
  );
}

function ProfileSummary({ profile }: { profile: MyProfile }) {
  const s = statusText[profile.status];
  const d = profile.details;
  const rows: [string, string][] = [
    ["First name", profile.first_name],
    ["Age", String(ageFromBirthYear(profile.birth_year))],
    ["City", `${profile.city}, ${profile.state}`],
  ];
  if (d) {
    rows.push(
      ["Height", formatHeight(d.height_inches)],
      ["Size", `${sizeTypeLabel(d.size_type)}, size ${d.size_number}${d.letter_size ? ` (${d.letter_size})` : ""}`],
    );
    if (d.about_style) rows.push(["My style", d.about_style]);
  }

  return (
    <>
      <section aria-labelledby="status-heading" className="rounded-2xl bg-surface p-6 ring-1 ring-silver-200">
        <h2 id="status-heading" className="mt-0! text-2xl font-semibold">Profile status: {s.title}</h2>
        <p className="mt-1">{s.text}</p>
      </section>

      <section aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-2xl font-semibold">Your details</h2>
        <dl className="mt-3 divide-y divide-silver-200 rounded-2xl bg-surface ring-1 ring-silver-200">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]">
              <dt className="font-semibold">{k}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-base text-muted">Height and size are only shown to brands, never to the public.</p>
      </section>

      <section aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="text-2xl font-semibold">Your photos</h2>
        <ul className="mt-3 grid gap-6 sm:grid-cols-3">
          {profile.photos.map((p) => {
            const kind = PHOTO_KINDS.find((k) => k.value === p.kind);
            const vis = VISIBILITY.find((v) => v.value === p.visibility);
            return (
              <li key={p.id} className="overflow-hidden rounded-xl bg-surface ring-1 ring-silver-200">
                <div className="aspect-[3/4] bg-silver-100">
                  {p.url && (
                    // eslint-disable-next-line @next/next/no-img-element -- private signed link, not optimizable
                    <img src={p.url} alt={`Your photo: ${kind?.label.toLowerCase() ?? p.kind}`} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold">{kind?.label ?? p.kind}</p>
                  <p className="text-muted">Who can see it: <strong className="text-ink">{vis?.label ?? p.visibility}</strong></p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
