import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink } from "./ButtonLink";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/lib/supabase/server";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#founding-members", label: "Members" },
  { href: "/about", label: "About" },
];

const textLink =
  "inline-flex min-h-12 items-center rounded-full px-4 text-lg text-ink underline-offset-4 hover:underline";

export function SiteHeader() {
  return (
    <header className="border-b border-silver-200 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold text-ink no-underline sm:text-[1.7rem]"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-1 gap-y-2">
          <ul className="hidden items-center gap-x-1 lg:flex">
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
    <ButtonLink href="/account" className="min-h-12! px-6! text-base!">
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
      <ButtonLink href="/join" className="min-h-12! px-6! text-base!">
        Join free
      </ButtonLink>
    </>
  );
}
