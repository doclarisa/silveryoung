"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { supabaseConfigured } from "@/lib/supabase/env";
import { buttonClasses } from "@/components/ButtonLink";
import { withTimeout } from "@/lib/with-timeout";
import type { Dictionary } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/format";

type Step = "email" | "code";
type LoginText = Dictionary["login"];

const inputClasses =
  "mt-2 block w-full min-h-14 rounded-xl border-2 border-silver-300 bg-surface px-4 text-xl text-ink focus:border-plum focus:outline-none focus-visible:outline-3 focus-visible:outline-plum";

function friendlyError(message: string, e: LoginText["errors"]): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return e.rateLimit;
  if (m.includes("expired") || m.includes("invalid") || m.includes("token")) return e.badCode;
  if (m.includes("timeout") || m.includes("fetch") || m.includes("network")) return e.network;
  if (m.includes("sending") || m.includes("smtp")) return e.sending;
  if (m.includes("email")) return e.email;
  return e.generic;
}

/** t: sign-in words in the page's language. accountPath: "My account" in that language. */
export function LoginForm({ t, accountPath }: { t: LoginText; accountPath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), accountPath);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? t.errors.linkExpired : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  async function sendEmail() {
    if (!supabaseConfigured) {
      setError(t.errors.notConfigured);
      return false;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = createClient();
      // Keep this address plain: the email template adds "?token_hash=…" to it.
      // The link then opens My account, in the language this visitor chose (saved in a cookie).
      const confirmUrl = new URL("/auth/confirm", window.location.origin);
      const { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: confirmUrl.toString(), shouldCreateUser: true },
        }),
      );
      if (error) {
        setError(friendlyError(error.message, t.errors));
        return false;
      }
      return true;
    } catch (e) {
      console.error("Sign-in email failed", e);
      setError(friendlyError(e instanceof Error ? e.message : "", t.errors));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (await sendEmail()) {
      setStep("code");
      setCode("");
    }
  }

  async function onSubmitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await withTimeout(
        supabase.auth.verifyOtp({
          email: email.trim(),
          token: code.replace(/\D/g, ""),
          type: "email",
        }),
      );
      if (error) {
        setBusy(false);
        setError(friendlyError(error.message, t.errors));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (e) {
      console.error("Code check failed", e);
      setBusy(false);
      setError(friendlyError(e instanceof Error ? e.message : "", t.errors));
    }
  }

  async function resend() {
    if (await sendEmail()) setNotice(t.resent);
  }

  return (
    <div className="max-w-xl">
      {error && (
        <p role="alert" className="mb-6 rounded-xl border-2 border-plum bg-plum-50 p-4 text-lg">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-6 rounded-xl bg-silver-100 p-4 text-lg">
          {notice}
        </p>
      )}

      {step === "email" ? (
        <form onSubmit={onSubmitEmail} noValidate={false}>
          <label htmlFor="email" className="block text-xl font-semibold">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
          <p className="mt-2 text-lg text-muted">
            {t.emailHint}
          </p>
          <button type="submit" disabled={busy} className={buttonClasses("primary", "mt-6 w-full sm:w-auto disabled:opacity-60")}>
            {busy ? t.sending : t.sendButton}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitCode}>
          <div role="status" className="mb-6 rounded-xl bg-silver-100 p-5 text-lg">
            <p className="font-semibold">{t.checkTitle}</p>
            <p>{fmt(t.checkText, { email })}</p>
          </div>
          <label htmlFor="code" className="block text-xl font-semibold">
            {t.codeLabel}
          </label>
          <input
            id="code"
            name="code"
            required
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9 ]{6,12}"
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClasses} max-w-xs tracking-[0.3em]`}
          />
          <button type="submit" disabled={busy} className={buttonClasses("primary", "mt-6 w-full sm:w-auto disabled:opacity-60")}>
            {busy ? t.signingIn : t.signInButton}
          </button>
          <div className="mt-8 flex flex-col items-start gap-2">
            <button type="button" onClick={resend} disabled={busy} className="min-h-12 text-lg text-plum underline underline-offset-4">
              {t.resend}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                setNotice(null);
              }}
              className="min-h-12 text-lg text-plum underline underline-offset-4"
            >
              {t.differentEmail}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
