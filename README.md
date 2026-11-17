# Silver Young Models

*Be the face brands forgot.* This is the website for silveryoungmodels.com, built with
Next.js, Tailwind CSS and Supabase.

## Run it on your computer

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Where things are

| What | Where |
|---|---|
| Database setup (paste into Supabase SQL editor) | `supabase/schema.sql` |
| Site name, tagline, contact email | `src/lib/site.ts` |
| Homepage text (founder story etc.) | `src/app/page.tsx` |
| About / Privacy / Terms / Contact | `src/app/about`, `privacy`, `terms`, `contact` |
| Colors and fonts | `src/app/globals.css`, `src/app/layout.tsx` |
| Things to do before launch | `TODO.md` |

## Languages

The site is in English, Russian and Greek. English keeps plain addresses (`/join`);
Russian and Greek use `/ru/join` and `/el/join`. The visitor's choice is remembered.

- All words on the site: `src/i18n/dictionaries/en.ts`, `ru.ts`, `el.ts`
  (same keys in each; TypeScript complains if one is missing).
- Language settings and link helper: `src/i18n/config.ts`
- Pages live in `src/app/[lang]/`; `src/proxy.ts` sends plain addresses to English.
