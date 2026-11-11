import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/PageShell";
import { ButtonLink } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "About",
  description:
    "Silver Young Models connects clothing brands with real people aged 50 and over for paid photo shoots.",
};

export default function AboutPage() {
  return (
    <PageShell title="About Silver Young Models" intro="Be the face brands forgot.">
      <Placeholder>
        Tell your story here: who you are, why this matters to you, and what you hope members
        will get out of it.
      </Placeholder>
      <h2>What we do</h2>
      <p>
        We help everyday people aged 50 and over get discovered by clothing brands. Members
        share a few photos of their style. When a brand chooses someone, the brand sends the
        clothes, the member takes the photos at home, keeps the clothes, and gets paid.
      </p>
      <h2>Real people only</h2>
      <p>
        Every face on this site belongs to a real member who chose to share it. We never use
        stock photos or computer-generated faces.
      </p>
      <div className="pt-4">
        <ButtonLink href="/join">Join as a Founding Member</ButtonLink>
      </div>
    </PageShell>
  );
}
