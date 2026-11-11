# TODO

## Before opening sign-ups to the public

- [ ] **Photo moderation.** Right now, once a member is approved, any new photo they upload
      goes live immediately. Before public launch, add a per-photo review step:
      a `reviewed_at` column on `photos`, required by the public read policies
      (table + storage), plus a "New photos to review" list on the admin page.
- [ ] Set up a custom email sender (SMTP) in Supabase. The built-in sender only allows a
      few emails per hour.
- [ ] Have Privacy and Terms reviewed.
- [ ] Replace the placeholder contact email in `src/lib/site.ts`.
- [ ] Write the founder story (homepage) and About page.
