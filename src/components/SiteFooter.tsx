import Link from "next/link";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-silver-200 bg-silver-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <p className="font-serif text-2xl font-semibold">{site.name}</p>
        <p className="mt-1 text-lg text-muted">{site.tagline}</p>

        <nav aria-label="Footer" className="mt-6">
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-12 items-center rounded-full px-3 text-lg text-ink underline underline-offset-4 hover:text-plum"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-base text-muted">
          © {site.name}. All member photos are of real members who chose to share them.
        </p>
      </div>
    </footer>
  );
}
