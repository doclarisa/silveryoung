import Link from "next/link";

/**
 * "Founding Members" grid.
 * Step 1: shows gray placeholder tiles only.
 * Step 4: real approved members (photo, first name, age, city) fill the
 * first tiles; placeholders fill the rest until there are enough members.
 */
const PLACEHOLDER_COUNT = 6;

export function FoundingMembers() {
  return (
    <section
      id="founding-members"
      aria-labelledby="founding-heading"
      className="scroll-mt-6 bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 id="founding-heading" className="text-4xl font-semibold sm:text-5xl">
          Meet our Founding Members
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-muted">
          The very first faces of Silver Young Models. Real people, real style, no
          retouching. Tap a photo to see their profile.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <li key={i}>
              <PlaceholderTile />
            </li>
          ))}
        </ul>
      </div>
    </section>
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
