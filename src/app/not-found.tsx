import { PageShell } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <PageShell title="We could not find that page" intro="The link may be old, or the page may have moved.">
      <div className="pt-2">
        <ButtonLink href="/">Go to the homepage</ButtonLink>
      </div>
    </PageShell>
  );
}
