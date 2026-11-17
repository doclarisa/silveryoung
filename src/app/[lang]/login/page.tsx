import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.login.title, description: t.login.metaDescription, robots: { index: false } };
}

export default async function LoginPage() {
  const { t, href } = await getI18n();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.login.title}</h1>
      <p className="mt-4 text-xl text-muted">
        {t.login.intro}
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-lg">{t.common.loading}</p>}>
          <LoginForm t={t.login} accountPath={href("/account")} />
        </Suspense>
      </div>
      <p className="mt-12 text-lg">
        {t.login.moreFirst}{" "}
        <Link href={href("/join")} className="prose-link">
          {t.login.seeHow}
        </Link>
      </p>
    </div>
  );
}
