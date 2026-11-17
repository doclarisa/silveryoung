import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "./ButtonLink";
import { getFoundingMembers, photoAlt, tilePhoto, type PublicMember } from "@/lib/public-members";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/format";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * "Founding Members" grid: real approved members (photo, first name, age,
 * city) first; gray "Your photo here" spots fill the grid up to six tiles.
 */
const MIN_TILES = 6;

export async function FoundingMembers() {
  const [{ t, href }, members] = await Promise.all([getI18n(), getFoundingMembers()]);
  const openSpots = Math.max(0, MIN_TILES - members.length);

  return (
    <section
      id="founding-members"
      aria-labelledby="founding-heading"
      className="scroll-mt-6 bg-paper py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 id="founding-heading" className="text-4xl font-semibold sm:text-5xl">
          {t.home.membersHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-muted">{t.home.membersIntro}</p>

        <ul className="mt-10 grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id}>
              <MemberTile member={m} t={t} link={href(`/members/${m.id}`)} />
            </li>
          ))}
          {Array.from({ length: openSpots }, (_, i) => (
            <li key={`open-${i}`}>
              <PlaceholderTile t={t} link={href("/join")} />
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl bg-surface p-7 ring-1 ring-silver-200 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <p className="text-xl">
            <span className="font-semibold">{t.home.membersCtaBold}</span> {t.home.membersCtaText}
          </p>
          <ButtonLink href={href("/join")} className="mt-5 w-full shrink-0 sm:mt-0 sm:w-auto">
            {t.home.membersCtaButton}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function MemberTile({ member, t, link }: { member: PublicMember; t: Dictionary; link: string }) {
  const photo = tilePhoto(member);
  return (
    <Link href={link} className="group block rounded-2xl no-underline">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-silver-100 ring-1 ring-silver-200">
        {photo && (
          <Image
            src={photo.url}
            alt={photoAlt(member, photo.kind, t)}
            fill
            sizes="(min-width: 1024px) 352px, (min-width: 420px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">
        {member.firstName}, {member.age}
      </p>
      <p className="text-lg text-muted">
        {member.city}, {member.state}
      </p>
      <p className="text-lg text-plum underline underline-offset-4">
        {fmt(t.home.memberSeePhotos, { name: member.firstName })}
      </p>
    </Link>
  );
}

function PlaceholderTile({ t, link }: { t: Dictionary; link: string }) {
  return (
    <Link href={link} className="group block rounded-2xl no-underline" aria-label={t.home.openSpotLabel}>
      <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl bg-silver-100 p-6 text-center ring-1 ring-silver-200 transition-colors group-hover:bg-silver-200">
        <p className="font-serif text-2xl font-semibold text-silver-600">{t.home.openSpotPhoto}</p>
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">{t.home.openSpotTitle}</p>
      <p className="text-lg text-plum underline underline-offset-4">{t.home.openSpotLink}</p>
    </Link>
  );
}
