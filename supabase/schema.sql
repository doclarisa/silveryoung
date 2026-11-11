-- =====================================================================
-- Silver Young Models — Stage 1 database setup
-- HOW TO USE: Supabase dashboard → SQL Editor → New query →
--             paste this whole file → Run. Run it once on a fresh project.
-- BEFORE RUNNING: replace YOUR-EMAIL@example.com (near the bottom of
--             section 1) with the email you will log in with as admin.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. ADMIN LIST
-- Only emails in this table can approve or hide members.
-- No one can read or change it from the website; only from this SQL editor.
-- ---------------------------------------------------------------------
create table public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;

insert into public.admin_emails (email) values ('YOUR-EMAIL@example.com');

-- true when the logged-in person's email is in admin_emails
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;


-- ---------------------------------------------------------------------
-- 2. PROFILES  (public-safe info only: shown on the website)
-- One row per member. id = their login id.
-- status: pending (new) → approved (shown on site) or hidden.
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text not null check (char_length(first_name) between 1 and 40),
  -- We store birth year, not age, so age stays correct over time.
  -- The website shows age as (this year − birth_year).
  -- The 50+ rule is checked by the profiles_guard trigger below.
  birth_year  int  not null check (birth_year between 1900 and 2100),
  city        text not null check (char_length(city) between 1 and 60),
  state       text not null check (char_length(state) between 1 and 40),
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'hidden')),
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index profiles_status_idx on public.profiles (status, approved_at);


-- ---------------------------------------------------------------------
-- 3. MEMBER DETAILS  (private: only the member and admin can see)
-- Kept in a separate table so height/size/bio can never leak to visitors.
-- ---------------------------------------------------------------------
-- Sizes are stored as separate, fixed choices so brands can filter later:
--   size_type   : misses | petite | plus | tall
--   size_number : numeric size, e.g. 0–40 (plus sizes like 18W are stored as 18)
--   letter_size : optional XS–3XL
create table public.member_details (
  profile_id    uuid primary key references public.profiles(id) on delete cascade,
  height_inches smallint not null check (height_inches between 48 and 90),
  size_type     text not null check (size_type in ('misses', 'petite', 'plus', 'tall')),
  size_number   smallint not null check (size_number between 0 and 40),
  letter_size   text check (letter_size in ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
  about_style   text check (char_length(about_style) <= 600),
  updated_at    timestamptz not null default now()
);
create index member_details_size_idx
  on public.member_details (size_type, size_number);


-- ---------------------------------------------------------------------
-- 4. PHOTOS
-- TODO(moderation): approved members' new photos go live immediately.
--   Before opening sign-ups to the public, add a per-photo review
--   (e.g. a "reviewed" column that the public read policies require).
--   See TODO.md.
-- kind: front (full-length), side (full-length), closeup (smiling).
-- visibility: public (anyone) or brands (only member + admin for now;
-- brand accounts arrive in a later stage).
-- storage_path must live inside the member's own folder.
-- ---------------------------------------------------------------------
create table public.photos (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  kind         text not null check (kind in ('front', 'side', 'closeup')),
  storage_path text not null unique,
  visibility   text not null default 'public' check (visibility in ('public', 'brands')),
  sort_order   smallint not null default 0,
  width        int,
  height       int,
  created_at   timestamptz not null default now(),
  unique (profile_id, kind),
  check (storage_path like profile_id::text || '/%')
);
create index photos_profile_idx on public.photos (profile_id, sort_order);


-- ---------------------------------------------------------------------
-- 5. CONSENTS  (permanent record of what each member agreed to, and when)
-- Members can add a consent but never edit or delete one.
-- ---------------------------------------------------------------------
create table public.consents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  consent_type text not null default 'photos_and_brand_sharing',
  consent_text text not null,
  agreed_at    timestamptz not null default now()
);
create index consents_user_idx on public.consents (user_id);


-- ---------------------------------------------------------------------
-- 6. SAFETY TRIGGERS
-- ---------------------------------------------------------------------

-- Members cannot approve themselves: only an admin (or this SQL editor)
-- can change status. Also keeps timestamps honest.
-- (Intentionally NOT "security definer", so current_user is the real caller.)
create or replace function public.profiles_guard()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  can_moderate boolean :=
    public.is_admin() or current_user not in ('anon', 'authenticated');
begin
  -- 50+ rule: checked when joining, and whenever birth year is changed.
  -- (We only know the year, so someone turning 50 this year qualifies.)
  if (tg_op = 'INSERT' or new.birth_year is distinct from old.birth_year)
     and extract(year from now())::int - new.birth_year < 50 then
    raise exception 'Members must be 50 or older.'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    if not can_moderate then
      new.status := 'pending';
      new.approved_at := null;
    end if;
    new.created_at := now();
  else
    if not can_moderate then
      new.status := old.status;
      new.approved_at := old.approved_at;
    end if;
    new.created_at := old.created_at;
  end if;

  if new.status = 'approved'
     and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
    new.approved_at := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard
  before insert or update on public.profiles
  for each row execute function public.profiles_guard();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger member_details_updated_at
  before insert or update on public.member_details
  for each row execute function public.set_updated_at();

-- Consent time is always set by the server, never by the browser.
create or replace function public.consents_stamp()
returns trigger
language plpgsql
as $$
begin
  new.agreed_at := now();
  return new;
end;
$$;

create trigger consents_stamp
  before insert on public.consents
  for each row execute function public.consents_stamp();


-- ---------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (who can see / change which rows)
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.member_details enable row level security;
alter table public.photos         enable row level security;
alter table public.consents       enable row level security;

grant select on public.profiles, public.photos to anon;
grant select, insert, update, delete
  on public.profiles, public.member_details, public.photos to authenticated;
grant select, insert on public.consents to authenticated;

-- PROFILES
create policy "Anyone sees approved profiles; members see their own; admin sees all"
  on public.profiles for select to anon, authenticated
  using (status = 'approved' or id = auth.uid() or public.is_admin());

create policy "Members create their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Members edit their own profile; admin edits any"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Members delete their own profile; admin deletes any"
  on public.profiles for delete to authenticated
  using (id = auth.uid() or public.is_admin());

-- MEMBER DETAILS (private)
create policy "Only the member or admin can read details"
  on public.member_details for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "Members create their own details"
  on public.member_details for insert to authenticated
  with check (profile_id = auth.uid());

create policy "Members edit their own details"
  on public.member_details for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Members delete their own details"
  on public.member_details for delete to authenticated
  using (profile_id = auth.uid());

-- PHOTOS
create policy "Visitors see public photos of approved members; members see their own; admin sees all"
  on public.photos for select to anon, authenticated
  using (
    (visibility = 'public' and exists (
       select 1 from public.profiles p
       where p.id = photos.profile_id and p.status = 'approved'))
    or profile_id = auth.uid()
    or public.is_admin()
  );

create policy "Members add their own photos"
  on public.photos for insert to authenticated
  with check (profile_id = auth.uid());

create policy "Members change their own photos"
  on public.photos for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Members delete their own photos; admin deletes any"
  on public.photos for delete to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- CONSENTS
create policy "Members see their own consents; admin sees all"
  on public.consents for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "Members record their own consent"
  on public.consents for insert to authenticated
  with check (user_id = auth.uid());


-- ---------------------------------------------------------------------
-- 8. PHOTO STORAGE
-- One PRIVATE bucket. Files are stored as  <member-id>/<random-id>.jpg
-- The website shows photos through short-lived signed links, and the
-- rules below decide who may get one — so "Brands only" photos and
-- photos of pending/hidden members can never be opened by visitors,
-- even if someone guesses the address.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-photos', 'member-photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "member-photos: read"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'member-photos' and (
      (storage.foldername(storage.objects.name))[1] = auth.uid()::text
      or public.is_admin()
      or exists (
        select 1
        from public.photos ph
        join public.profiles p on p.id = ph.profile_id
        where ph.storage_path = storage.objects.name
          and ph.visibility = 'public'
          and p.status = 'approved'
      )
    )
  );

create policy "member-photos: upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'member-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "member-photos: replace own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'member-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'member-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "member-photos: delete own files (admin: any)"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'member-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Done. You should see "Success. No rows returned".
