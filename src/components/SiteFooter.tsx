import Link from "next/link";
import { LogoLockup } from "./Logo";
import { site } from "@/lib/site";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
  { href: "/#for-brands", label: "For brands" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-night text-cream">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <LogoLockup size="lg" />
            <p className="mt-4 font-serif text-xl italic text-mist">{site.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-1 gap-y-1">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-12 items-center px-3 text-base uppercase tracking-[0.12em] text-cream underline decoration-mist/60 underline-offset-8 hover:decoration-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-base text-mist">
          © {site.name}. All member photos are of real members who chose to share them.
        </p>
      </div>
    </footer>
  );
}
