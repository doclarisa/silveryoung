import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { getApprovedMemberIds, getPublicMember, photoAlt, tilePhoto } from "@/lib/public-members";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";
import { fmt } from "@/i18n/format";

// Build pages for approved members ahead of time; newer members are built on first visit.
// (Cache Components needs at least one entry, so a placeholder stands in when there are none.)
export async function generateStaticParams() {
  const ids = await getApprovedMemberIds();
  return ids.length ? ids.map((id) => ({ id })) : [{ id: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/members/[id]">): Promise<Metadata> {
  const [{ id }, { locale, t }] = await Promise.all([params, getI18n()]);
  const m = await getPublicMember(id);
  if (!m) return { title: t.member.notFoundTitle, robots: { index: false } };
  const vars = { name: m.firstName, age: m.age, city: m.city, state: m.state };
  const title = fmt(t.member.title, vars);
  const description = fmt(t.member.description, vars);
  const photo = tilePhoto(m);
  return {
    title,
    description,
    alternates: alternatesFor(locale, `/members/${m.id}`),
    openGraph: {
      title,
      description,
      type: "profile",
      images: photo ? [{ url: photo.url, alt: photoAlt(m, photo.kind, t) }] : undefined,
    },
  };
}

export default async function MemberPage({ params }: PageProps<"/[lang]/members/[id]">) {
  const { t, href } = await getI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href={href("/#founding-members")} className="inline-flex min-h-12 items-center text-lg text-plum underline underline-offset-4">
        {t.member.back}
      </Link>
      <Suspense fallback={<p className="mt-8 text-lg">{t.common.loading}</p>}>
        <MemberDetails params={params} />
      </Suspense>
    </div>
  );
}

async function MemberDetails({ params }: { params: PageProps<"/[lang]/members/[id]">["params"] }) {
  const [{ id }, { t, href }] = await Promise.all([params, getI18n()]);
  const m = await getPublicMember(id);
  if (!m) notFound();
  const mt = t.member;
  const name = { name: m.firstName };

  return (
    <article className="mt-6">
      <header>
        <p className="inline-block rounded-full bg-plum-50 px-4 py-1 text-base font-semibold text-plum-dark ring-1 ring-plum/30">
          {mt.badge}
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
          {m.firstName}, {m.age}
        </h1>
        <p className="mt-2 text-xl text-muted">
          {m.city}, {m.state}
        </p>
      </header>

      {m.photos.length > 0 ? (
        <ul className="mt-10 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {m.photos.map((p, i) => (
            <li key={p.kind} className="overflow-hidden rounded-2xl bg-silver-100 ring-1 ring-silver-200">
              <Image
                src={p.url}
                alt={photoAlt(m, p.kind, t)}
                width={p.width ?? 1200}
                height={p.height ?? 1600}
                preload={i === 0}
                sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl bg-silver-100 p-6 text-lg">{fmt(mt.brandsOnly, name)}</p>
      )}

      <section aria-labelledby="brands-heading" className="mt-12 rounded-2xl bg-surface p-7 ring-1 ring-silver-200 sm:p-9">
        <h2 id="brands-heading" className="text-2xl font-semibold sm:text-3xl">
          {mt.brandHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-lg">{fmt(mt.brandText, name)}</p>
        <ButtonLink href={href("/contact")} className="mt-6">
          {fmt(mt.brandButton, name)}
        </ButtonLink>
      </section>

      <section aria-labelledby="join-heading" className="mt-8 rounded-2xl bg-plum-50 p-7 sm:p-9">
        <h2 id="join-heading" className="text-2xl font-semibold sm:text-3xl">
          {mt.joinHeading}
        </h2>
        <p className="mt-2 text-lg">{fmt(mt.joinText, name)}</p>
        <ButtonLink href={href("/join")} variant="secondary" className="mt-6">
          {t.common.joinFree}
        </ButtonLink>
      </section>
    </article>
  );
}
