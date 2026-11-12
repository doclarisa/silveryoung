import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { FoundingMembers } from "@/components/FoundingMembers";
import { HomeHero } from "@/components/HomeHero";

// Homepage text lives in this file. Section order follows homepage-copy.md.

const steps = [
  {
    title: "Share your style",
    text: "Create your profile in about 5 minutes. Add three photos taken on your phone, and tell us your size and city.",
  },
  {
    title: "A brand picks your look",
    text: "Fashion brands browse our members and send requests like “Women 60+ to model our new fall sweaters.” When you’re a match, you’ll hear from us.",
  },
  {
    title: "Get the clothes and get paid",
    text: "The brand ships you their clothes. You take the photos at home or anywhere you love. You keep the clothes and get paid for your photos.",
  },
];

const reasons = [
  {
    title: "No experience? Perfect.",
    text: "You don’t need a portfolio, an agent or a “model look.” Real style is exactly what brands are looking for.",
  },
  {
    title: "Model from home.",
    text: "No auditions, no travel, no waiting rooms. Your living room, your garden or your favorite beach is your studio.",
  },
  {
    title: "New clothes, real pay.",
    text: "Every brand shoot comes with clothes to keep and payment for your photos.",
  },
  {
    title: "Your photos, your choice.",
    text: "For every photo, you decide: show it to everyone, or only to brands.",
  },
];

const brandSteps = [
  "Post a request with the age, size and style you need",
  "Choose the members you love from their profiles",
  "Ship your clothes and receive real-life photos, cleared for your marketing",
];

const privacyPromises = [
  "We only show your first name, age and city, never your address, email or phone.",
  "You choose who sees each photo.",
  "Brands contact you only through our site, never directly.",
  "You can change or delete your profile anytime.",
];

const faqs = [
  { q: "Does it cost anything?", a: "No. Joining is completely free." },
  {
    q: "Do I need professional photos?",
    a: "Not at all. Phone photos taken in daylight are perfect. We’ll show you simple tips.",
  },
  {
    q: "What if I’ve never modeled before?",
    a: "Most of our members haven’t! If you enjoy clothes and a little fun in front of the camera, you’re ready.",
  },
  {
    q: "Who are the brands?",
    a: "We’re partnering with clothing brands that dress women over 50. As Founding Members join, the first brand requests are on their way.",
  },
  {
    q: "Is there an age limit?",
    a: "Our members are 50 and up, with no upper limit. Style only gets better.",
  },
];

export default function Home() {
  return (
    <>
      <HomeHero />

      {/* HOW IT WORKS */}
      <Section id="how-it-works" heading="Modeling, made simple" bg="bg-paper">
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-surface p-7 shadow-sm ring-1 ring-silver-200">
              <p className="text-lg font-semibold text-plum">Step {i + 1}</p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{s.title}</h3>
              <p className="mt-3 text-lg text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* WHY JOIN */}
      <Section id="why-join" heading="Why you’ll love it" bg="bg-surface">
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {reasons.map((r) => (
            <li key={r.title} className="rounded-2xl bg-silver-50 p-7 ring-1 ring-silver-200">
              <h3 className="text-2xl font-semibold">{r.title}</h3>
              <p className="mt-2 text-lg text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FoundingMembers />

      {/* FOUNDER STORY */}
      <section aria-labelledby="founder-heading" className="bg-silver-50 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
          <h2 id="founder-heading" className="text-4xl font-semibold sm:text-5xl">
            Why I started Silver Young Models
          </h2>
          <div className="mt-6 space-y-5 text-xl">
            <p>
              I love fashion, and I always have. But when I looked at clothing ads, I rarely saw
              women like me and my friends: women with silver hair, laugh lines and decades of
              great style.
            </p>
            <p>
              So I decided to create a place where we&rsquo;re the models. Where brands can find
              real women who wear their clothes beautifully, and where every one of us can enjoy
              being in front of the camera.
            </p>
            <p>Welcome. I&rsquo;m so glad you&rsquo;re here.</p>
            <p className="font-serif text-2xl italic">&mdash; Larisa, Founder</p>
          </div>
        </div>
      </section>

      {/* FOR BRANDS */}
      <Section id="for-brands" heading="For fashion brands" bg="bg-surface">
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
          <p className="text-xl text-muted">
            Your customers over 50 want to see themselves in your clothes. Silver Young Models
            connects you with real women of every size and age who love to be photographed.
          </p>
          <div>
            <DotList items={brandSteps} />
            <ButtonLink href="/contact" variant="secondary" className="mt-8">
              Partner with us
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* PRIVACY PROMISE */}
      <Section id="privacy-promise" heading="Safe, private and always respectful" bg="bg-plum-50">
        <div className="mt-8">
          <DotList items={privacyPromises} />
        </div>
      </Section>

      {/* FAQ: all answers shown open, so nothing is hidden behind small controls */}
      <Section id="faq" heading="Questions? We have answers." bg="bg-paper">
        <dl className="mt-10 grid gap-6 md:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-surface p-7 ring-1 ring-silver-200">
              <dt className="text-2xl font-semibold font-serif">{f.q}</dt>
              <dd className="mt-2 text-lg text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-plum py-16 text-white sm:py-20">
        <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
          <h2 className="text-4xl font-semibold sm:text-5xl">Your style deserves to be seen.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-white/90">
            Join today and be part of something beautiful from the very beginning.
          </p>
          <ButtonLink href="/join" variant="light" className="mt-8">
            Join as a Founding Member
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function Section({
  id,
  heading,
  bg,
  children,
}: {
  id: string;
  heading: string;
  bg: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`scroll-mt-6 py-16 sm:py-20 ${bg}`}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <h2 id={`${id}-heading`} className="text-4xl font-semibold sm:text-5xl">
          {heading}
        </h2>
        {children}
      </div>
    </section>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4 text-xl">
      {items.map((item) => (
        <li key={item} className="flex gap-4">
          <span aria-hidden="true" className="mt-3 h-3 w-3 shrink-0 rounded-full bg-plum" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
