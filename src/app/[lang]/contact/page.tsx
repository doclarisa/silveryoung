import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { site } from "@/lib/site";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.contact.metaTitle, description: t.contact.metaDescription, alternates: alternatesFor(locale, "/contact") };
}

export default async function ContactPage() {
  const { t } = await getI18n();
  const c = t.contact;
  const [before, after] = c.emailUs.split("{email}");
  return (
    <PageShell title={c.title} intro={c.intro}>
      <p>
        {before}
        <a href={`mailto:${site.contactEmail}`} className="prose-link">
          {site.contactEmail}
        </a>
        {after}
      </p>
      <p>{c.brands}</p>
    </PageShell>
  );
}
