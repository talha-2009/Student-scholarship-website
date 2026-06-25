-- Create a function to trigger AI content generation for new opportunities
-- This function will be called via a webhook or manually when needed

create or replace function public.trigger_ai_content_generation(opportunity_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- This function is designed to be called from the application layer
  -- It marks the opportunity for AI content generation
  -- The actual generation happens via the Edge Function
  
  -- Log the trigger
  insert into public.ai_generation_logs (opportunity_id, status, triggered_at)
  values (opportunity_id, 'pending', now())
  on conflict (opportunity_id) do update set
    status = 'pending',
    triggered_at = now(),
    updated_at = now();
    
  raise notice 'AI content generation triggered for opportunity: %', opportunity_id;
end;
$$;

-- Create a table to track AI generation logs
create table if not exists public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  triggered_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint ai_generation_logs_opportunity_id_unique unique (opportunity_id)
);

-- Create indexes for the logs table
create index if not exists ai_generation_logs_status_idx on public.ai_generation_logs (status);
create index if not exists ai_generation_logs_opportunity_id_idx on public.ai_generation_logs (opportunity_id);

-- Enable RLS on the logs table
alter table public.ai_generation_logs enable row level security;

-- Create policy for service role to manage logs
create policy "Service role can manage AI generation logs"
on public.ai_generation_logs
for all
to service_role
using (true)
with check (true);

-- Create policy for authenticated users to read logs
create policy "Authenticated users can read AI generation logs"
on public.ai_generation_logs
for select
to authenticated
using (true);

-- Add comments
comment on function public.trigger_ai_content_generation is 'Triggers AI content generation for a specific opportunity';
comment on table public.ai_generation_logs is 'Logs tracking AI content generation status for opportunities';
