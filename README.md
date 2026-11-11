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
