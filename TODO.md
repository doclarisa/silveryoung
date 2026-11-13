# TODO

## Before opening sign-ups to the public

- [ ] **Photo moderation.** Right now, once a member is approved, any new photo they upload
      goes live immediately. Before public launch, add a per-photo review step:
      a `reviewed_at` column on `photos`, required by the public read policies
      (table + storage), plus a "New photos to review" list on the admin page.
- [x] Set up a custom email sender (SMTP) in Supabase: done with Resend, 2026-11-13. The built-in sender only allows a
      few emails per hour.
- [ ] Have Privacy and Terms reviewed.
- [ ] Replace the placeholder contact email in `src/lib/site.ts`.
- [ ] Write the About page.

## Promises the homepage makes that the site doesn't do yet

- [ ] **Founding Member badge** and "first pick of brand requests".
- [ ] **"Brands contact you only through our site"**: needs brand accounts and messaging
      (later stage). Until then, brand contact must go through you.
- [ ] **"Photos cleared for your marketing"**: Terms must include a photo licence that
      members agree to for each brand shoot.
