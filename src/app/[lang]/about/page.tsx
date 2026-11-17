import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.about.metaTitle, description: t.about.metaDescription, alternates: alternatesFor(locale, "/about") };
}

export default async function AboutPage() {
  const { t, href } = await getI18n();
  const a = t.about;
  return (
    <PageShell title={a.title} intro={a.intro}>
      <Placeholder>{a.placeholder}</Placeholder>
      <h2>{a.whatHeading}</h2>
      <p>{a.whatText}</p>
      <h2>{a.realHeading}</h2>
      <p>{a.realText}</p>
      <div className="pt-4">
        <ButtonLink href={href("/join")}>{t.common.joinFounding}</ButtonLink>
      </div>
    </PageShell>
  );
}
