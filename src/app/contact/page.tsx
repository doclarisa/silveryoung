import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Silver Young Models.",
};

export default function ContactPage() {
  return (
    <PageShell title="Contact us" intro="We would love to hear from you.">
      <p>
        Email us at{" "}
        <a href={`mailto:${site.contactEmail}`} className="prose-link">
          {site.contactEmail}
        </a>
        . We usually reply within two business days.
      </p>
      <p>Brands interested in working with our members are welcome to write to the same address.</p>
    </PageShell>
  );
}
