import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using Silver Young Models.",
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use">
      <Placeholder>
        This is a starting draft, not legal advice. Have it reviewed before launch.
      </Placeholder>
      <h2>Who can join</h2>
      <p>Members must be 50 years of age or older and may only upload photos of themselves.</p>
      <h2>Your photos</h2>
      <p>
        You keep ownership of your photos. By joining, you allow us to show your Public photos
        on this website and to show your profile to brands.
      </p>
      <h2>Brand opportunities</h2>
      <p>
        Being a member does not guarantee a photo shoot. Each brand opportunity will have its
        own terms, which you can accept or decline.
      </p>
    </PageShell>
  );
}
