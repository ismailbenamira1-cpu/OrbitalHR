-- ============================================================================
-- ORBITAL HR MVP — SUPABASE DATABASE & ROW LEVEL SECURITY (RLS) SETUP
-- Paste this entire script into Supabase -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Table for Public Early-Access Leads (Anyone can submit; only logged-in admins can read)
create table if not exists public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  work_email text not null,
  company_name text not null,
  company_size text not null,
  target_countries text,
  created_at timestamptz not null default now()
);

alter table public.early_access_leads enable row level security;

revoke all on table public.early_access_leads from anon, authenticated;
grant insert on table public.early_access_leads to anon, authenticated;
grant select on table public.early_access_leads to authenticated;

create policy "Public can submit early access leads"
  on public.early_access_leads
  for insert
  to anon, authenticated
  with check (char_length(work_email) > 3 and char_length(company_name) > 1);

create policy "Authenticated users can view leads"
  on public.early_access_leads
  for select
  to authenticated
  using (true);

-- 2. Table for Customer Employee Rosters (Each signed-in user sees & edits only their own rows)
create table if not exists public.employee_rosters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  employee_name text not null,
  home_country text not null check (home_country in ('United States', 'Canada')),
  host_region text not null check (
    host_region in (
      'Schengen Area',
      'United Kingdom',
      'Mexico',
      'India',
      'Philippines',
      'Thailand',
      'Indonesia'
    )
  ),
  role_level text not null,
  days_used integer not null default 0 check (days_used >= 0 and days_used <= 366),
  current_setup text not null default 'Home Payroll',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employee_rosters enable row level security;

revoke all on table public.employee_rosters from anon, authenticated;
grant select, insert, update, delete on table public.employee_rosters to authenticated;

create policy "Users can view their own roster"
  on public.employee_rosters
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert into their own roster"
  on public.employee_rosters
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own roster"
  on public.employee_rosters
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete from their own roster"
  on public.employee_rosters
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
