import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/PageShell";
import { getI18n } from "@/i18n/server";
import { alternatesFor } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.privacy.metaTitle, description: t.privacy.metaDescription, alternates: alternatesFor(locale, "/privacy") };
}

export default async function Page() {
  const { t } = await getI18n();
  const page = t.privacy;
  return (
    <PageShell title={page.title} intro={page.intro}>
      <Placeholder>{page.placeholder}</Placeholder>
      {page.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          <p className="mt-3">{s.p}</p>
        </section>
      ))}
    </PageShell>
  );
}
