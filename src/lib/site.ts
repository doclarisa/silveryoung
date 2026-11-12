// Site-wide settings. Edit text here and it updates everywhere.
export const site = {
  name: "Silver Young Models",
  tagline: "Silver hair. Young spirit.",
  description:
    "Share your style, get discovered by fashion brands, and get paid to model their clothes. Free to join for women 50 and over. No experience needed.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://silveryoungmodels.com").replace(/\/$/, ""),
  // TODO: replace with your real contact address before launch.
  contactEmail: "hello@silveryoungmodels.com",
  // Homepage header video. Put the files in /public/hero/ and fill these in.
  // Leave as null to show the plum background instead.
  heroVideo: null as null | { src: string; poster: string; label?: string },
  // Example once the files exist:
  // heroVideo: { src: "/hero/hero.mp4", poster: "/hero/hero-poster.jpg" },
};
