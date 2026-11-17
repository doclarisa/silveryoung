import Image from "next/image";
import { ButtonLink } from "./ButtonLink";
import { HeroVideo } from "./HeroVideo";
import { site } from "@/lib/site";
import { getI18n } from "@/i18n/server";
import heroBeach from "@/assets/hero-beach.jpg";

// To swap the picture: replace src/assets/hero-beach.jpg (keep it wide, people on the right).

/**
 * Homepage header.
 * Phones: the picture sits as a band on top, text below on near-black (people stay visible).
 * Larger screens: the picture fills the screen, dark shading on the left behind the text.
 * When site.heroVideo is set, the video replaces the picture on larger screens.
 */
export async function HomeHero() {
  const { t, href } = await getI18n();
  const HERO_ALT = t.home.heroAlt;
  return (
    <section className="relative isolate overflow-hidden bg-night text-cream sm:flex sm:min-h-[min(88svh,56rem)] sm:items-end">
      {/* Phone: picture band */}
      <div className="relative aspect-[16/10] sm:hidden">
        <Image
          src={heroBeach}
          alt={HERO_ALT}
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[85%_65%]"
        />
      </div>

      {/* Larger screens: full background */}
      <div className="absolute inset-0 -z-10 hidden sm:block">
        {site.heroVideo ? (
          <HeroVideo
            src={site.heroVideo.src}
            poster={site.heroVideo.poster}
            label={site.heroVideo.label}
            pauseLabel={t.common.videoPause}
            playLabel={t.common.videoPlay}
          />
        ) : (
          <Image
            src={heroBeach}
            alt={HERO_ALT}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-[70%_60%]"
          />
        )}
        {/* Dark shading keeps the text readable over the bright sky */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-night/90 from-0% via-night/60 via-45% to-transparent to-80%"
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:pb-20 sm:pt-32">
        <div className="max-w-2xl [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]">
          <p className="text-base uppercase tracking-[0.3em] text-cream/90">{t.home.heroEyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold sm:text-7xl">{t.common.tagline}</h1>
          <p className="mt-6 text-xl text-cream/95 sm:text-2xl">
            {t.home.heroText}
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href={href("/join")} variant="light" className="uppercase tracking-[0.12em]">
            {t.common.joinFounding}
          </ButtonLink>
          <ButtonLink href={href("/#for-brands")} variant="outlineLight" className="uppercase tracking-[0.12em]">
            {t.home.heroForBrands}
          </ButtonLink>
        </div>
        <p className="mt-6 text-lg italic text-cream/90">
          {t.home.heroNote}
        </p>
      </div>
    </section>
  );
}
