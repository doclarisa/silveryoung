import Link from "next/link";
import { LogoLockup } from "./Logo";
import { site } from "@/lib/site";
import { getI18n } from "@/i18n/server";

export async function SiteFooter() {
  const { t, href } = await getI18n();
  const f = t.common.footer;
  const footerLinks = [
    { href: href("/about"), label: f.about },
    { href: href("/join"), label: f.join },
    { href: href("/#for-brands"), label: f.forBrands },
    { href: href("/privacy"), label: f.privacy },
    { href: href("/terms"), label: f.terms },
    { href: href("/contact"), label: f.contact },
  ];

  return (
    <footer className="mt-auto bg-night text-cream">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <LogoLockup size="lg" />
            <p className="mt-4 font-serif text-xl italic text-mist">{t.common.tagline}</p>
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
          © {site.name}. {f.note}
        </p>
      </div>
    </footer>
  );
}
