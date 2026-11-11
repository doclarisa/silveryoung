// Site-wide settings. Edit text here and it updates everywhere.
export const site = {
  name: "Silver Young Models",
  tagline: "Be the face brands forgot.",
  description:
    "Everyday people aged 50 and over share their style and get chosen by clothing brands for paid photo shoots. Keep the clothes, get paid.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://silveryoungmodels.com").replace(/\/$/, ""),
  // TODO: replace with your real contact address before launch.
  contactEmail: "hello@silveryoungmodels.com",
};
