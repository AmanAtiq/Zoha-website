-- =============================================================
-- ZOHA ASIF — Supabase schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- After running, seed the data with:  npm run seed
-- =============================================================

create extension if not exists pgcrypto;

-- ---------- Books ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_urdu text default '',
  type text not null check (type in ('episodic', 'short-novel', 'afsana')),
  type_label text default '',
  badge text default '',
  cover text default '',
  hero text default '',
  tagline text default '',
  cta_label text default '',
  pdf text default '',
  description text default '',
  description_ur text default '',
  author_note text default '',
  excerpt_ur text default '',
  excerpt_source text default '',
  excerpt_episode_slug text default '',
  quote_ur text default '',
  quote_en text default '',
  quote_source text default '',
  genres text[] default '{}',
  for_you text[] default '{}',
  reading_tips jsonb default '[]',
  rating_avg numeric default 0,
  rating_count integer default 0,
  rating_dist integer[] default '{0,0,0,0,0}',
  more_episodes_coming boolean default false,
  content_placeholder boolean default false,
  placeholder_copy boolean default false,
  home_visible boolean default true,
  home_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Episodes ----------
create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  book_slug text not null references public.books(slug) on delete cascade,
  slug text not null,
  episode_number integer default 0,
  title text default '',
  urdu_title text default '',
  teaser_ur text default '',
  synopsis text default '',
  closing_line_ur text default '',
  pdf text default '',
  read_time text default '',
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (book_slug, slug)
);

-- ---------- Reviews / comments ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_slug text references public.books(slug) on delete cascade,
  episode_slug text default null,
  name text default '',
  when_display text default '',
  rating integer default 5,
  text text default '',
  approved boolean default false,
  featured boolean default false,
  created_at timestamptz default now()
);

-- ---------- Homepage testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text default '',
  source text default '',
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ---------- Homepage settings (single row) ----------
create table if not exists public.home_settings (
  id integer primary key default 1,
  hero_slugs text[] default '{}',
  episodic_slugs text[] default '{}',
  short_novel_slugs text[] default '{}',
  afsana_slugs text[] default '{}',
  hero_autoplay_ms integer default 6500,
  hero_lede text default '',
  reviews_lede text default '',
  quote_text text default '',
  quote_cite text default '',
  author_intro jsonb default '{}',
  faqs jsonb default '[]',
  updated_at timestamptz default now()
);

insert into public.home_settings (id) values (1)
  on conflict (id) do nothing;

-- ---------- Prebooking ----------
create table if not exists public.prebooking (
  book_slug text primary key references public.books(slug) on delete cascade,
  price numeric,
  status text default 'prebooking' check (status in ('prebooking', 'coming-soon')),
  note text default '',
  pitch text default '',
  points text[] default '{}',
  show_on_store boolean default true,
  updated_at timestamptz default now()
);

-- ---------- Admin sessions (simple password login) ----------
create table if not exists public.admin_sessions (
  token text primary key,
  created_at timestamptz default now()
);

-- ---------- Row Level Security ----------
alter table public.books enable row level security;
alter table public.episodes enable row level security;
alter table public.reviews enable row level security;
alter table public.testimonials enable row level security;
alter table public.home_settings enable row level security;
alter table public.prebooking enable row level security;
alter table public.admin_sessions enable row level security;

-- Public read
create policy "public read books" on public.books for select using (true);
create policy "public read episodes" on public.episodes for select using (true);
create policy "public read reviews" on public.reviews for select using (true);
create policy "public read testimonials" on public.testimonials for select using (active = true);
create policy "public read home settings" on public.home_settings for select using (true);
create policy "public read prebooking" on public.prebooking for select using (true);

-- Public: submit a review. The `approved` column is no longer used as a
-- moderation gate (the site shows every comment), so reads allow all rows and
-- inserts are always stored as unapproved.
create policy "public submit review" on public.reviews for insert with check (approved = false);

-- Admin sessions are only touched by the server (service role bypasses RLS)
create policy "no anon sessions" on public.admin_sessions for all using (false) with check (false);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists books_updated_at on public.books;
create trigger books_updated_at before update on public.books
  for each row execute function public.set_updated_at();

drop trigger if exists episodes_updated_at on public.episodes;
create trigger episodes_updated_at before update on public.episodes
  for each row execute function public.set_updated_at();

drop trigger if exists prebooking_updated_at on public.prebooking;
create trigger prebooking_updated_at before update on public.prebooking
  for each row execute function public.set_updated_at();

drop trigger if exists home_settings_updated_at on public.home_settings;
create trigger home_settings_updated_at before update on public.home_settings
  for each row execute function public.set_updated_at();

-- ---------- Indexes ----------
create index if not exists books_type_idx on public.books (type);
create index if not exists books_home_idx on public.books (home_visible, home_order);
create index if not exists episodes_book_idx on public.episodes (book_slug, episode_number);
create index if not exists reviews_book_idx on public.reviews (book_slug);
create index if not exists reviews_approved_idx on public.reviews (approved);

-- ---------- Storage (for admin image/pdf uploads) ----------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Public read of assets
create policy "public read assets" on storage.objects
  for select using (bucket_id = 'assets');

-- Admin uploads happen server-side with the service role key (bypasses RLS),
-- so no insert policy is granted to anon/authenticated here.
