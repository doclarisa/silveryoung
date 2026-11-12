import Image from "next/image";
import { ButtonLink } from "./ButtonLink";
import { HeroVideo } from "./HeroVideo";
import { site } from "@/lib/site";
import heroBeach from "@/assets/hero-beach.jpg";

// To swap the picture: replace src/assets/hero-beach.jpg (keep it wide, people on the right).
const HERO_ALT =
  "On a sunny beach, a woman with long silver hair in a white dress poses by the sea while a friend photographs her.";

/**
 * Homepage header.
 * Phones: the picture sits as a band on top, text below on deep plum (people stay visible).
 * Larger screens: the picture fills the header, plum shading on the left behind the text.
 * When site.heroVideo is set, the video replaces the picture on larger screens.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#2a1726] text-white sm:flex sm:min-h-[min(80svh,52rem)] sm:items-center">
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
        {/* Plum shading keeps the white text readable over the bright sky */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#2a1726]/90 from-0% via-[#2a1726]/65 via-45% to-transparent to-80%"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-24">
        <div className="max-w-2xl [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]">
          <h1 className="text-5xl font-semibold sm:text-7xl">{site.tagline}</h1>
          <p className="mt-6 text-xl text-white/95 sm:text-2xl">
            Share your style, get discovered by fashion brands, and get paid to model their
            clothes.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/join" variant="light">
            Join as a Founding Member
          </ButtonLink>
        </div>
        <p className="mt-6 text-lg italic text-white/90">
          Free to join. No experience needed. Just you and your phone.
        </p>
      </div>
    </section>
  );
}
