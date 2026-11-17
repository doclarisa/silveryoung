import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "./ButtonLink";
import { LogoLockup } from "./Logo";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/lib/supabase/server";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#founding-members", label: "Members" },
  { href: "/#for-brands", label: "For brands" },
  { href: "/about", label: "About" },
];

// Spaced capitals, but kept at full reading size (18–19px) for older eyes.
const textLink =
  "inline-flex min-h-12 items-center px-3 text-base uppercase tracking-[0.12em] text-cream underline-offset-8 decoration-2 hover:underline";

export function SiteHeader() {
  return (
    <header className="bg-night text-cream">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link href="/" className="rounded-lg no-underline" aria-label={`${site.name}, home`}>
          <LogoLockup />
        </Link>

        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-1 gap-y-2">
          <ul className="hidden items-center lg:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={textLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Who is signed in is only known per visitor, so this part loads separately. */}
          <Suspense fallback={<SignedOutLinks />}>
            <AccountLinks />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

async function AccountLinks() {
  const user = await getCurrentUser();
  if (!user) return <SignedOutLinks />;
  return (
    <ButtonLink href="/account" variant="light" className="ml-2 min-h-12! px-6! text-base!">
      My account
    </ButtonLink>
  );
}

function SignedOutLinks() {
  return (
    <>
      <Link href="/login" className={`${textLink} underline lg:no-underline`}>
        Sign in
      </Link>
      <ButtonLink href="/join" variant="light" className="ml-2 min-h-12! px-6! text-base!">
        Join free
      </ButtonLink>
    </>
  );
}
