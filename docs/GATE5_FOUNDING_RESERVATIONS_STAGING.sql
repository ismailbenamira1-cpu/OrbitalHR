-- Review draft; run only after billing foundation in isolated staging.
begin;
create table public.founding_reservations (
 slot smallint primary key check (slot between 1 and 10),
 user_id uuid not null unique references public.billing_accounts(user_id) on delete restrict,
 attempt_id uuid not null unique default gen_random_uuid(),
 created_at timestamptz not null default now(),
 stripe_session_id text unique,
 state text not null default 'reserved' check (state in ('reserved','paid'))
);
alter table public.founding_reservations enable row level security;
revoke all on public.founding_reservations from public,anon,authenticated;
grant select,insert,update,delete on public.founding_reservations to service_role;
-- Serialize reservations. No automatic release: an ambiguous Stripe response must
-- be reconciled before a slot can be reused. This favors safety over availability.
create function public.reserve_founding_slot(p_user uuid)
returns public.founding_reservations
language plpgsql security invoker set search_path = ''
as $$
declare r public.founding_reservations; s smallint;
begin
 perform pg_catalog.pg_advisory_xact_lock(8675309);
 select * into r from public.founding_reservations where user_id=p_user;
 if found then return r; end if;
 if not exists(select 1 from public.billing_accounts where user_id=p_user and subscription_status='none' and stripe_subscription_id is null) then
   raise exception 'Account not eligible';
 end if;
 select n into s from pg_catalog.generate_series(1,10) n where not exists(select 1 from public.founding_reservations f where f.slot=n) order by n limit 1;
 if s is null then raise exception 'No founding slots available'; end if;
 insert into public.founding_reservations(slot,user_id) values(s,p_user) returning * into r;
 return r;
end $$;
revoke all on function public.reserve_founding_slot(uuid) from public,anon,authenticated;
grant execute on function public.reserve_founding_slot(uuid) to service_role;
commit;
