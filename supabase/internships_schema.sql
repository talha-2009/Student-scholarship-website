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
