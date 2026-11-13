import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Silver Young Models with a code sent to your email. No password needed.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">Sign in</h1>
      <p className="mt-4 text-xl text-muted">
        New here? Use the same steps. We&rsquo;ll create your account when you sign in for the
        first time.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-lg">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-12 text-lg">
        Want to know more first?{" "}
        <Link href="/join" className="prose-link">
          See how joining works
        </Link>
      </p>
    </div>
  );
}
