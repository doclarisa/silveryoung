"use client";

import { usePathname } from "next/navigation";
import { localeNames, locales, lp, splitLocale, type Locale } from "@/i18n/config";

/**
 * EN · RU · EL. Plain links (full page load, no prefetch), so the remembered
 * language only changes when someone actually clicks. English links go
 * through /en/…, which saves English and drops the prefix.
 */
export function LanguageSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const { path } = splitLocale(pathname);

  return (
    <nav aria-label={label} className="flex items-center">
      <ul className="flex items-center">
        {locales.map((l) => {
          const href = l === "en" ? `/en${path === "/" ? "" : path}` : lp(l, path);
          const active = l === current;
          return (
            <li key={l}>
              <a
                href={href}
                hrefLang={l}
                lang={l}
                aria-current={active ? "true" : undefined}
                aria-label={localeNames[l].name}
                className={`inline-flex min-h-12 min-w-12 items-center justify-center px-2 text-base tracking-[0.12em] ${
                  active ? "font-semibold text-cream underline decoration-2 underline-offset-8" : "text-mist hover:text-cream"
                }`}
              >
                {localeNames[l].short}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
