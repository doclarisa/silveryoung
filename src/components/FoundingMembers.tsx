import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "./ButtonLink";
import { getFoundingMembers, photoAlt, tilePhoto, type PublicMember } from "@/lib/public-members";

/**
 * "Founding Members" grid: real approved members (photo, first name, age,
 * city) first; gray "Your photo here" spots fill the grid up to six tiles.
 */
const MIN_TILES = 6;

export async function FoundingMembers() {
  const members = await getFoundingMembers();
  const openSpots = Math.max(0, MIN_TILES - members.length);

  return (
    <section
      id="founding-members"
      aria-labelledby="founding-heading"
      className="scroll-mt-6 bg-paper py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 id="founding-heading" className="text-4xl font-semibold sm:text-5xl">
          Meet our Founding Members
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-muted">
          Real women with real style, and the very first faces of Silver Young Models.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id}>
              <MemberTile member={m} />
            </li>
          ))}
          {Array.from({ length: openSpots }, (_, i) => (
            <li key={`open-${i}`}>
              <PlaceholderTile />
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl bg-surface p-7 ring-1 ring-silver-200 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <p className="text-xl">
            <span className="font-semibold">Want to be one of them?</span> Founding Members get a
            special badge and first pick of brand requests.
          </p>
          <ButtonLink href="/join" className="mt-5 w-full shrink-0 sm:mt-0 sm:w-auto">
            Become a Founding Member
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function MemberTile({ member }: { member: PublicMember }) {
  const photo = tilePhoto(member);
  return (
    <Link href={`/members/${member.id}`} className="group block rounded-2xl no-underline">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-silver-100 ring-1 ring-silver-200">
        {photo && (
          <Image
            src={photo.url}
            alt={photoAlt(member, photo.kind)}
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
        See {member.firstName}&rsquo;s photos
      </p>
    </Link>
  );
}

function PlaceholderTile() {
  return (
    <Link
      href="/join"
      className="group block rounded-2xl no-underline"
      aria-label="Open spot for a Founding Member. Join to claim it."
    >
      <div className="flex aspect-[4/5] flex-col items-center justify-center rounded-2xl bg-silver-100 p-6 text-center ring-1 ring-silver-200 transition-colors group-hover:bg-silver-200">
        <p className="font-serif text-2xl font-semibold text-silver-600">Your photo here</p>
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">Founding Member spot</p>
      <p className="text-lg text-plum underline underline-offset-4">Could this be you?</p>
    </Link>
  );
}
