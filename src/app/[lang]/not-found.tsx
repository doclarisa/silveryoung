import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t, href } = await getI18n();
  return (
    <PageShell title={t.notFound.title} intro={t.notFound.intro}>
      <div className="pt-2">
        <ButtonLink href={href("/")}>{t.notFound.home}</ButtonLink>
      </div>
    </PageShell>
  );
}
