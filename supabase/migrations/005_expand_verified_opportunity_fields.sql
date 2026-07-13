-- Support verified, long-form opportunity records and broader opportunity types.

alter table public.opportunities
  add column if not exists deadline_status text not null default 'fixed'
    check (deadline_status in ('fixed', 'rolling', 'varies', 'not_announced')),
  add column if not exists host_organization text,
  add column if not exists duration text,
  add column if not exists eligibility_criteria text,
  add column if not exists benefits text,
  add column if not exists required_documents text,
  add column if not exists application_process text,
  add column if not exists selection_criteria text,
  add column if not exists important_notes text,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_source text;

alter table public.opportunities
  drop constraint if exists opportunities_type_check;

alter table public.opportunities
  add constraint opportunities_type_check check (
    type in (
      'Scholarship',
      'Internship',
      'Fellowship',
      'Conference',
      'Exchange Program',
      'Competition',
      'Summer Program',
      'Research Program',
      'Research Grant',
      'Grant',
      'Volunteer Program',
      'Youth Program',
      'Training Program'
    )
  );

create index if not exists opportunities_deadline_status_idx on public.opportunities (deadline_status);
create index if not exists opportunities_host_organization_idx on public.opportunities (host_organization);
