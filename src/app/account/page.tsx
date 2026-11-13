import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { buttonClasses } from "@/components/ButtonLink";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <PageShell title="My account">
      <Suspense fallback={<p>Loading your account…</p>}>
        <AccountDetails />
      </Suspense>
    </PageShell>
  );
}

async function AccountDetails() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <>
      <p>
        You are signed in as <strong>{user.email}</strong>.
      </p>
      {/* Step 3 adds the profile form; Step 5 adds editing, photo visibility and account deletion. */}
      <p className="rounded-xl bg-silver-100 p-4 text-muted">
        Your profile and photos will appear here soon.
      </p>
      <form action={signOut} className="pt-4">
        <button type="submit" className={buttonClasses("secondary")}>
          Sign out
        </button>
      </form>
    </>
  );
}
