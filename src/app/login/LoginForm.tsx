"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { supabaseConfigured } from "@/lib/supabase/env";
import { buttonClasses } from "@/components/ButtonLink";

type Step = "email" | "code";

const NOT_CONFIGURED =
  "Sign-in isn't switched on for this website yet. Please try again later, or contact us.";

/** Never leave the button stuck: give up after 20 seconds with a clear message. */
function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

const inputClasses =
  "mt-2 block w-full min-h-14 rounded-xl border-2 border-silver-300 bg-surface px-4 text-xl text-ink focus:border-plum focus:outline-none focus-visible:outline-3 focus-visible:outline-plum";

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Too many emails were sent just now. Please wait a few minutes, then try again.";
  }
  if (m.includes("expired") || m.includes("invalid") || m.includes("token")) {
    return "That code didn't work. It may be mistyped or expired. Check it, or send a new code.";
  }
  if (m.includes("timeout") || m.includes("fetch") || m.includes("network")) {
    return "We couldn't reach the sign-in service. Please check your internet connection and try again.";
  }
  if (m.includes("sending") || m.includes("smtp")) {
    return "We couldn't send the email just now. Please try again in a few minutes. If it keeps happening, contact us.";
  }
  if (m.includes("email")) {
    return "Please check that your email address is typed correctly.";
  }
  return "Something went wrong. Please try again in a moment.";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "link"
      ? "That sign-in link has expired or was already used. Please send yourself a new one."
      : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  async function sendEmail() {
    if (!supabaseConfigured) {
      setError(NOT_CONFIGURED);
      return false;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const supabase = createClient();
      const confirmUrl = new URL("/auth/confirm", window.location.origin);
      const { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: confirmUrl.toString(), shouldCreateUser: true },
        }),
      );
      if (error) {
        setError(friendlyError(error.message));
        return false;
      }
      return true;
    } catch (e) {
      console.error("Sign-in email failed", e);
      setError(friendlyError(e instanceof Error ? e.message : ""));
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
        setError(friendlyError(error.message));
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (e) {
      console.error("Code check failed", e);
      setBusy(false);
      setError(friendlyError(e instanceof Error ? e.message : ""));
    }
  }

  async function resend() {
    if (await sendEmail()) setNotice("We sent you a new email with a new code.");
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
            Your email address
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
            We&rsquo;ll email you a sign-in link and a code. No password needed.
          </p>
          <button type="submit" disabled={busy} className={buttonClasses("primary", "mt-6 w-full sm:w-auto disabled:opacity-60")}>
            {busy ? "Sending…" : "Email me a sign-in code"}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitCode}>
          <div role="status" className="mb-6 rounded-xl bg-silver-100 p-5 text-lg">
            <p className="font-semibold">Check your email</p>
            <p>
              We sent an email to <strong>{email}</strong>. Tap the link in it, or type the code
              from the email below. It can take a minute to arrive. Check your spam folder too.
            </p>
          </div>
          <label htmlFor="code" className="block text-xl font-semibold">
            Code from the email
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
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="mt-8 flex flex-col items-start gap-2">
            <button type="button" onClick={resend} disabled={busy} className="min-h-12 text-lg text-plum underline underline-offset-4">
              Send me a new code
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
              Use a different email address
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
