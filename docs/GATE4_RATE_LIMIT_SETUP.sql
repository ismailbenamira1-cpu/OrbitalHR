-- Gate 4.5: atomic anonymous lead-submission rate limiting.
-- Apply this in OrbitalHR Supabase SQL Editor BEFORE enabling
-- LEAD_RATE_LIMIT_ENABLED in Cloudflare Pages.
-- Writes no raw IPs or emails. Counters hold HMAC digests supplied by the backend.

begin;

create table if not exists public.lead_rate_counters (
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count between 1 and 10000),
  primary key (bucket_key, window_start)
);

alter table public.lead_rate_counters enable row level security;
revoke all on public.lead_rate_counters from public, anon, authenticated;
grant select, insert, update on public.lead_rate_counters to service_role;

create or replace function public.consume_lead_rate_limit(
  p_ip_hash text,
  p_email_hash text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ip_allowed boolean := false;
  email_allowed boolean := false;
  current_time timestamptz := now();
begin
  if p_ip_hash is null or p_email_hash is null
     or p_ip_hash !~ '^[0-9a-f]{64}$'
     or p_email_hash !~ '^[0-9a-f]{64}$'
  then
    return false;
  end if;

  -- Atomic, strict per-IP fixed window: max 10 verified submissions/hour.
  insert into public.lead_rate_counters (bucket_key, window_start, request_count)
  values ('ip:' || p_ip_hash, date_trunc('hour', current_time), 1)
  on conflict (bucket_key, window_start)
  do update set request_count = public.lead_rate_counters.request_count + 1
  where public.lead_rate_counters.request_count < 10
  returning true into ip_allowed;

  if not coalesce(ip_allowed, false) then
    return false;
  end if;

  -- Atomic, strict per-email fixed window: max 3 attempts/UTC day.
  insert into public.lead_rate_counters (bucket_key, window_start, request_count)
  values ('email:' || p_email_hash, date_trunc('day', current_time at time zone 'UTC') at time zone 'UTC', 1)
  on conflict (bucket_key, window_start)
  do update set request_count = public.lead_rate_counters.request_count + 1
  where public.lead_rate_counters.request_count < 3
  returning true into email_allowed;

  return coalesce(email_allowed, false);
end;
$$;

revoke all on function public.consume_lead_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.consume_lead_rate_limit(text, text) to service_role;

commit;

-- After creating, verify permissions:
-- select rolname,has_function_privilege(rolname,
--   'public.consume_lead_rate_limit(text,text)','EXECUTE') can_execute
-- from pg_roles where rolname in ('anon','authenticated','service_role');
-- Expected false, false, true.
-- Periodic maintenance: delete buckets older than 7 days during an
-- approved maintenance window using:
-- delete from public.lead_rate_counters where window_start < now()-interval '7 days';
