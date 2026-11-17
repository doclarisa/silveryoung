import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";
import { fmt } from "@/i18n/format";
import { Suspense } from "react";
import { PhotoTips } from "@/components/PhotoTips";
import { ButtonLink } from "@/components/ButtonLink";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/members";
import { JoinForm } from "./JoinForm";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.join.metaTitle, description: t.join.metaDescription, alternates: alternatesFor(locale, "/join") };
}

export default async function JoinPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.join.title}</h1>
      <p className="mt-4 max-w-2xl text-xl text-muted">
        {t.join.intro}
      </p>

      {/* Who is signed in is only known per visitor, so this part loads separately. */}
      <Suspense fallback={<p className="mt-10 text-lg">{t.common.loading}</p>}>
        <JoinStep />
      </Suspense>
    </div>
  );
}

async function JoinStep() {
  const { locale, t, href } = await getI18n();
  const j = t.join;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <section aria-labelledby="need-heading" className="mt-10">
          <h2 id="need-heading" className="text-3xl font-semibold">{j.needHeading}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-lg">
            {j.needItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="photos-heading" className="mt-12">
          <h2 id="photos-heading" className="sr-only">{j.photoGuide}</h2>
          <PhotoTips />
        </section>

        <div className="mt-12 rounded-2xl border-2 border-plum bg-plum-50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">{j.step1Heading}</h2>
          <p className="mt-2 text-lg">
            {j.step1Text}
          </p>
          <ButtonLink href={href(`/login?next=${encodeURIComponent(href("/join"))}`)} className="mt-6">{j.step1Button}</ButtonLink>
        </div>
      </>
    );
  }

  const profile = await getMyProfile(user.id);
  if (profile) {
    return (
      <div role="status" className="mt-10 rounded-2xl border-2 border-plum bg-plum-50 p-6 sm:p-8">
        <p className="text-2xl font-semibold">{fmt(j.alreadyTitle, { name: profile.first_name })}</p>
        <p className="mt-2 text-lg">{j.alreadyText}</p>
        <ButtonLink href={href("/account")} className="mt-6">{j.alreadyButton}</ButtonLink>
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 text-lg">
        {fmt(j.signedInAs, { email: user.email })}
      </p>
      <details className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-silver-200">
        <summary className="cursor-pointer text-xl font-semibold">{j.tipsSummary}</summary>
        <div className="pt-6"><PhotoTips /></div>
      </details>
      <JoinForm
        userId={user.id}
        currentYear={new Date().getFullYear()}
        locale={locale}
        t={{ form: j.form, consentText: j.consentText, photoErrors: j.photoErrors, errors: j.errors, options: t.options }}
        links={{ privacy: href("/privacy"), terms: href("/terms"), account: href("/account?welcome=1") }}
      />
    </>
  );
}
