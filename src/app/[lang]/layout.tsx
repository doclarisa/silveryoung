import type { Metadata, Viewport } from "next";
import { Fraunces, Atkinson_Hyperlegible_Next, Literata, Noto_Sans } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { site } from "@/lib/site";
import { locales, localeRegion } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

// English: elegant serif for headings, and a body font designed for readers with low vision.
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: false,
});
// Russian and Greek: the fonts above have no Cyrillic or Greek letters, so these
// matching fonts are used instead (see globals.css). Only downloaded when used.
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic", "greek"],
  display: "swap",
  preload: false,
});
const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "cyrillic", "greek"],
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s | ${site.name}` },
    description: t.meta.description,
    openGraph: { siteName: site.name, locale: localeRegion[locale], type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#121013",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, t } = await getI18n();
  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${atkinson.variable} ${literata.variable} ${notoSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-plum px-6 py-3 text-lg font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {t.common.skipToContent}
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
