import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { getApprovedMemberIds, getPublicMember, photoAlt, tilePhoto } from "@/lib/public-members";
import { site } from "@/lib/site";

// Build pages for approved members ahead of time; newer members are built on first visit.
// (Cache Components needs at least one entry, so a placeholder stands in when there are none.)
export async function generateStaticParams() {
  const ids = await getApprovedMemberIds();
  return ids.length ? ids.map((id) => ({ id })) : [{ id: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/members/[id]">): Promise<Metadata> {
  const { id } = await params;
  const m = await getPublicMember(id);
  if (!m) return { title: "Member not found", robots: { index: false } };
  const title = `${m.firstName}, ${m.age}, from ${m.city}`;
  const description = `Meet ${m.firstName}, ${m.age}, from ${m.city}, ${m.state}: one of the Founding Members of ${site.name}.`;
  const photo = tilePhoto(m);
  return {
    title,
    description,
    alternates: { canonical: `/members/${m.id}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: photo ? [{ url: photo.url, alt: photoAlt(m, photo.kind) }] : undefined,
    },
  };
}

export default function MemberPage({ params }: PageProps<"/members/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/#founding-members" className="inline-flex min-h-12 items-center text-lg text-plum underline underline-offset-4">
        &larr; All Founding Members
      </Link>
      <Suspense fallback={<p className="mt-8 text-lg">Loading…</p>}>
        <MemberDetails params={params} />
      </Suspense>
    </div>
  );
}

async function MemberDetails({ params }: { params: PageProps<"/members/[id]">["params"] }) {
  const { id } = await params;
  const m = await getPublicMember(id);
  if (!m) notFound();

  return (
    <article className="mt-6">
      <header>
        <p className="inline-block rounded-full bg-plum-50 px-4 py-1 text-base font-semibold text-plum-dark ring-1 ring-plum/30">
          Founding Member
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
                alt={photoAlt(m, p.kind)}
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
        <p className="mt-10 rounded-2xl bg-silver-100 p-6 text-lg">
          {m.firstName} shares her photos with brands only.
        </p>
      )}

      <section aria-labelledby="brands-heading" className="mt-12 rounded-2xl bg-surface p-7 ring-1 ring-silver-200 sm:p-9">
        <h2 id="brands-heading" className="text-2xl font-semibold sm:text-3xl">
          Are you a brand?
        </h2>
        <p className="mt-2 max-w-2xl text-lg">
          Brands we work with can see more of {m.firstName}&rsquo;s photos, her height and her sizes. Tell us
          about your shoot and we&rsquo;ll put you in touch.
        </p>
        <ButtonLink href="/contact" className="mt-6">
          Contact us about {m.firstName}
        </ButtonLink>
      </section>

      <section aria-labelledby="join-heading" className="mt-8 rounded-2xl bg-plum-50 p-7 sm:p-9">
        <h2 id="join-heading" className="text-2xl font-semibold sm:text-3xl">
          50 or over, with style of your own?
        </h2>
        <p className="mt-2 text-lg">Join {m.firstName} as a Founding Member. It&rsquo;s free.</p>
        <ButtonLink href="/join" variant="secondary" className="mt-6">
          Join free
        </ButtonLink>
      </section>
    </article>
  );
}
