import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { FoundingMembers } from "@/components/FoundingMembers";
import { HomeHero } from "@/components/HomeHero";

import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";
import { fmt } from "@/i18n/format";

// Homepage text lives in src/i18n/dictionaries (home.*). Section order follows homepage-copy.md.

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  return { alternates: alternatesFor(locale, "/") };
}

export default async function Home() {
  const { t, href } = await getI18n();
  const h = t.home;
  return (
    <>
      <HomeHero />

      {/* HOW IT WORKS */}
      <Section id="how-it-works" heading={h.howHeading} bg="bg-paper">
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {h.steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-surface p-7 shadow-sm ring-1 ring-silver-200">
              <p className="text-lg font-semibold text-plum">{fmt(h.stepLabel, { n: i + 1 })}</p>
              <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{s.title}</h3>
              <p className="mt-3 text-lg text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* WHY JOIN */}
      <Section id="why-join" heading={h.whyHeading} bg="bg-surface">
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {h.reasons.map((r) => (
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
            {h.founderHeading}
          </h2>
          <div className="mt-6 space-y-5 text-xl">
            {h.founderParagraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
            <p className="font-serif text-2xl italic">{h.founderSignature}</p>
          </div>
        </div>
      </section>

      {/* FOR BRANDS */}
      <Section id="for-brands" heading={h.brandsHeading} bg="bg-surface">
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
          <p className="text-xl text-muted">
            {h.brandsText}
          </p>
          <div>
            <DotList items={h.brandSteps} />
            <ButtonLink href={href("/contact")} variant="secondary" className="mt-8">
              {h.brandsButton}
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* PRIVACY PROMISE */}
      <Section id="privacy-promise" heading={h.privacyHeading} bg="bg-plum-50">
        <div className="mt-8">
          <DotList items={h.privacyPromises} />
        </div>
      </Section>

      {/* FAQ: all answers shown open, so nothing is hidden behind small controls */}
      <Section id="faq" heading={h.faqHeading} bg="bg-paper">
        <dl className="mt-10 grid gap-6 md:grid-cols-2">
          {h.faqs.map((f) => (
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
          <h2 className="text-4xl font-semibold sm:text-5xl">{h.finalHeading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-white/90">
            {h.finalText}
          </p>
          <ButtonLink href={href("/join")} variant="light" className="mt-8">
            {t.common.joinFounding}
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
