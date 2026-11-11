import { ButtonLink } from "@/components/ButtonLink";
import { FoundingMembers } from "@/components/FoundingMembers";
import { site } from "@/lib/site";

const steps = [
  {
    title: "Share your style",
    text: "Join for free and add three simple photos taken at home. No modeling experience needed.",
  },
  {
    title: "A brand picks your look",
    text: "Clothing brands browse our members and choose people whose style fits their collection.",
  },
  {
    title: "Get the clothes + get paid",
    text: "The brand sends you the outfit. You take the photos, keep the clothes, and get paid.",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-lg font-semibold uppercase tracking-wider text-plum">
            For everyday people aged 50 and over
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold sm:text-7xl">{site.tagline}</h1>
          <p className="mt-6 max-w-2xl text-xl text-muted sm:text-2xl">
            Share your everyday style, get chosen by clothing brands for real photo shoots,
            keep the clothes, and get paid.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/join">Join as a Founding Member</ButtonLink>
            <ButtonLink href="/#how-it-works" variant="secondary">
              See how it works
            </ButtonLink>
          </div>
          <p className="mt-6 text-lg text-muted">Free to join. We never share your email or address.</p>
        </div>
      </section>

      <FoundingMembers />

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="scroll-mt-6 bg-paper py-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 id="how-heading" className="text-4xl font-semibold sm:text-5xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-surface p-7 shadow-sm ring-1 ring-silver-200">
                <p className="text-lg font-semibold text-plum">Step {i + 1}</p>
                <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{s.title}</h3>
                <p className="mt-3 text-lg text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FOUNDER STORY — EDIT ME: replace the paragraphs below with your story. */}
      <section aria-labelledby="founder-heading" className="bg-silver-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
          <h2 id="founder-heading" className="text-4xl font-semibold sm:text-5xl">
            Why I started Silver Young Models
          </h2>
          <div className="mt-6 space-y-5 text-xl">
            <p>
              [Placeholder] Flip through any clothing catalog and you will see the same young
              faces again and again. Yet people over 50 buy a huge share of the clothes, and
              we rarely see ourselves wearing them.
            </p>
            <p>
              [Placeholder] I started Silver Young Models to change that, by connecting brands
              with real people who have real style and decades of confidence to show for it.
            </p>
            <p className="font-serif text-2xl italic">[Placeholder] — Your name, Founder</p>
          </div>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION */}
      <section className="bg-plum py-16 text-white sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
          <h2 className="text-4xl font-semibold sm:text-5xl">Ready to be seen?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-white/90">
            Our first members become Founding Members, featured right here on the homepage.
          </p>
          <ButtonLink href="/join" variant="light" className="mt-8">
            Join as a Founding Member
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
