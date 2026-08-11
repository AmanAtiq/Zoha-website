-- Run once in the Supabase SQL Editor to unlock multi-quote homepage slides
-- and prebook-only titles. Safe to re-run (IF NOT EXISTS).

alter table public.home_settings
  add column if not exists quotes jsonb default '[]';

alter table public.books
  add column if not exists prebook_only boolean default false;
