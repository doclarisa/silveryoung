import type { Metadata } from "next";
import { PageShell, Placeholder } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Silver Young Models collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy" intro="In plain language: what we collect and why.">
      <Placeholder>
        This is a starting draft, not legal advice. Have it reviewed before launch.
      </Placeholder>
      <h2>What we collect</h2>
      <p>
        Your first name, email, birth year, city and state, height, clothing size, an optional
        note about your style, and the photos you upload.
      </p>
      <h2>What visitors can see</h2>
      <p>
        Once we approve your profile, anyone can see your first name, age, city and state, and
        any photos you marked as Public. Photos marked Brands only are never shown to visitors.
      </p>
      <h2>What we never show</h2>
      <p>We never show your email address, street address, or birth year to visitors.</p>
      <h2>Your choices</h2>
      <p>
        You can change which photos are public, delete photos, or delete your whole account at
        any time from My Account. Deleting your account permanently removes your profile and
        photos.
      </p>
    </PageShell>
  );
}
