import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "./ButtonLink";
import { LogoLockup } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { getCurrentUser } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/server";
import type { Dictionary } from "@/i18n/dictionaries";

// Spaced capitals, but kept at full reading size (18–19px) for older eyes.
const textLink =
  "inline-flex min-h-12 items-center px-3 text-base uppercase tracking-[0.12em] text-cream underline-offset-8 decoration-2 hover:underline";

export async function SiteHeader() {
  const { locale, t, href } = await getI18n();
  const navLinks = [
    { href: href("/#how-it-works"), label: t.common.nav.howItWorks },
    { href: href("/#founding-members"), label: t.common.nav.members },
    { href: href("/#for-brands"), label: t.common.nav.forBrands },
    { href: href("/about"), label: t.common.nav.about },
  ];

  return (
    <header className="bg-night text-cream">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link href={href("/")} className="rounded-lg no-underline" aria-label={t.common.homeLabel}>
          <LogoLockup />
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <nav aria-label="Main">
            <ul className="hidden items-center xl:flex">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={textLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* Who is signed in is only known per visitor, so this part loads separately. */}
          <Suspense fallback={<SignedOutLinks t={t} href={href} />}>
            <AccountLinks t={t} href={href} />
          </Suspense>
          <LanguageSwitch current={locale} label={t.common.languageLabel} />
        </div>
      </div>
    </header>
  );
}

type LinkProps = { t: Dictionary; href: (path: string) => string };

async function AccountLinks({ t, href }: LinkProps) {
  const user = await getCurrentUser();
  if (!user) return <SignedOutLinks t={t} href={href} />;
  return (
    <ButtonLink href={href("/account")} variant="light" className="min-h-12! px-6! text-base!">
      {t.common.myAccount}
    </ButtonLink>
  );
}

function SignedOutLinks({ t, href }: LinkProps) {
  return (
    <>
      <Link href={href("/login")} className={`${textLink} underline xl:no-underline`}>
        {t.common.signIn}
      </Link>
      <ButtonLink href={href("/join")} variant="light" className="min-h-12! px-6! text-base!">
        {t.common.joinFree}
      </ButtonLink>
    </>
  );
}
