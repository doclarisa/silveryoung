import type { Metadata } from "next";
import { Suspense } from "react";
import { PhotoTips } from "@/components/PhotoTips";
import { ButtonLink } from "@/components/ButtonLink";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/members";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "Join as a Founding Member",
  description:
    "Join Silver Young Models free. Share three photos of your style and get discovered by clothing brands for paid photo shoots.",
};

export default function JoinPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">Join as a Founding Member</h1>
      <p className="mt-4 max-w-2xl text-xl text-muted">
        It is free and takes about ten minutes. You must be 50 or older.
      </p>

      {/* Who is signed in is only known per visitor, so this part loads separately. */}
      <Suspense fallback={<p className="mt-10 text-lg">Loading…</p>}>
        <JoinStep />
      </Suspense>
    </div>
  );
}

async function JoinStep() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <section aria-labelledby="need-heading" className="mt-10">
          <h2 id="need-heading" className="text-3xl font-semibold">What you will need</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-lg">
            <li>Your email address</li>
            <li>Your first name, birth year, city and state</li>
            <li>Your height and clothing size</li>
            <li>Three photos from your phone or computer</li>
          </ul>
        </section>

        <section aria-labelledby="photos-heading" className="mt-12">
          <h2 id="photos-heading" className="sr-only">Photo guide</h2>
          <PhotoTips />
        </section>

        <div className="mt-12 rounded-2xl border-2 border-plum bg-plum-50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Step 1: confirm your email</h2>
          <p className="mt-2 text-lg">
            We&rsquo;ll email you a code. No password needed. Then you&rsquo;ll come straight back here to fill in your details and add your photos.
          </p>
          <ButtonLink href="/login?next=/join" className="mt-6">Start with my email</ButtonLink>
        </div>
      </>
    );
  }

  const profile = await getMyProfile(user.id);
  if (profile) {
    return (
      <div role="status" className="mt-10 rounded-2xl border-2 border-plum bg-plum-50 p-6 sm:p-8">
        <p className="text-2xl font-semibold">You have already joined, {profile.first_name}.</p>
        <p className="mt-2 text-lg">You can see your profile and photos on your account page.</p>
        <ButtonLink href="/account" className="mt-6">Go to My account</ButtonLink>
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 text-lg">
        You&rsquo;re signed in as <strong>{user.email}</strong>. Now tell us about yourself.
      </p>
      <details className="mt-6 rounded-xl bg-surface p-5 ring-1 ring-silver-200">
        <summary className="cursor-pointer text-xl font-semibold">Tips for great photos</summary>
        <div className="pt-6"><PhotoTips /></div>
      </details>
      <JoinForm userId={user.id} currentYear={new Date().getFullYear()} />
    </>
  );
}
