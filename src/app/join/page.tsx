import type { Metadata } from "next";
import { PhotoTips } from "@/components/PhotoTips";

export const metadata: Metadata = {
  title: "Join as a Founding Member",
  description:
    "Join Silver Young Models free. Share three photos of your style and get discovered by clothing brands for paid photo shoots.",
};

// Step 1: information only. The real sign-up form arrives in Steps 2–3.
export default function JoinPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">Join as a Founding Member</h1>
      <p className="mt-4 max-w-2xl text-xl text-muted">
        It is free and takes about ten minutes. You must be 50 or older.
      </p>

      <section aria-labelledby="need-heading" className="mt-10">
        <h2 id="need-heading" className="text-3xl font-semibold">
          What you will need
        </h2>
        <ul className="mt-4 space-y-2 text-lg">
          <li>Your first name, email, birth year, and city</li>
          <li>Your height and clothing size</li>
          <li>Three photos from your phone or computer</li>
        </ul>
      </section>

      <section aria-labelledby="photos-heading" className="mt-12">
        <h2 id="photos-heading" className="sr-only">
          Photo guide
        </h2>
        <PhotoTips />
      </section>

      <div
        role="status"
        className="mt-12 rounded-2xl border-2 border-plum bg-plum-50 p-6 text-lg"
      >
        <p className="font-semibold">Sign-up opens very soon.</p>
        <p className="text-muted">The sign-up form is being built right now. Please check back shortly.</p>
      </div>
    </div>
  );
}
