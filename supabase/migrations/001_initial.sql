-- Run this file in the Supabase SQL Editor to create both tables.
-- For seed data, run seed_opportunities.sql and seed_internships.sql separately.

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Scholarship', 'Internship', 'Fellowship')),
  funding text,
  title text not null,
  country text not null,
  level text,
  field text,
  deadline text,
  description text not null,
  link text not null,
  created_at timestamptz not null default now(),
  constraint opportunities_title_country_type_key unique (title, country, type)
);

alter table public.opportunities enable row level security;

drop policy if exists "Public can read opportunities" on public.opportunities;
create policy "Public can read opportunities"
on public.opportunities
for select
to anon
using (true);

create index if not exists opportunities_type_idx on public.opportunities (type);
create index if not exists opportunities_country_idx on public.opportunities (country);
create index if not exists opportunities_deadline_idx on public.opportunities (deadline);
create index if not exists opportunities_created_at_idx on public.opportunities (created_at desc);

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  country text not null,
  city text,
  internship_type text not null,
  degree_level text not null,
  duration text,
  funding text,
  deadline text,
  official_url text not null,
  description text not null,
  logo_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  constraint internships_title_organization_key unique (title, organization)
);

alter table public.internships enable row level security;

drop policy if exists "Public can read internships" on public.internships;
create policy "Public can read internships"
on public.internships
for select
to anon
using (true);

create index if not exists internships_featured_idx on public.internships (featured);
create index if not exists internships_country_idx on public.internships (country);
create index if not exists internships_type_idx on public.internships (internship_type);
