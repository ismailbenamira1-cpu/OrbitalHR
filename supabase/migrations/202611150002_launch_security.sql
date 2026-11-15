-- Backend-only metering for paid AI calls. Clients cannot read or reset counters.
create table if not exists public.ai_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null check (request_count >= 0),
  primary key(user_id, usage_date)
);
alter table public.ai_daily_usage enable row level security;
revoke all on table public.ai_daily_usage from anon, authenticated;
create or replace function public.consume_ai_daily_quota()
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  granted boolean;
begin
  if caller is null then return false; end if;
  insert into public.ai_daily_usage (user_id, usage_date, request_count)
  values (caller, (now() at time zone 'UTC')::date, 1)
  on conflict (user_id, usage_date)
  do update set request_count = public.ai_daily_usage.request_count + 1
  where public.ai_daily_usage.request_count < 20
  returning true into granted;
  return coalesce(granted, false);
end;
$$;
revoke all on function public.consume_ai_daily_quota() from public, anon;
grant execute on function public.consume_ai_daily_quota() to authenticated;

-- Leads are readable only via the Supabase administrative dashboard/service privileges,
-- never by an arbitrary authenticated product user.
drop policy if exists "Authenticated users can view leads" on public.early_access_leads;
revoke select on public.early_access_leads from authenticated;
