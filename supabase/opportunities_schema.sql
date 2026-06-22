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
