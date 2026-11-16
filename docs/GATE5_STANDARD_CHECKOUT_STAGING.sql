begin;
create table public.standard_checkout_attempts (
 user_id uuid primary key references public.billing_accounts(user_id) on delete restrict,
 attempt_id uuid not null unique default gen_random_uuid(),
 created_at timestamptz not null default now(),
 bound_customer_id text,
 checkout_origin text,
 stripe_session_id text unique,
 state text not null default 'reserved' check(state in ('reserved','paid'))
);
alter table public.standard_checkout_attempts enable row level security;
revoke all on public.standard_checkout_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.standard_checkout_attempts to service_role;
create function public.prepare_allocated_attempt(p_user uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare p text; r public.founding_reservations; s public.standard_checkout_attempts;
begin
 p:=public.allocate_billing_plan(p_user);
 if p='waitlist' then return jsonb_build_object('plan',p); end if;
 if p='founding' then
 select * into strict r from public.founding_reservations where user_id=p_user;
 return to_jsonb(r)||jsonb_build_object('plan',p);
 end if;
 insert into public.standard_checkout_attempts(user_id) values(p_user) on conflict(user_id) do nothing;
 select * into strict s from public.standard_checkout_attempts where user_id=p_user;
 return to_jsonb(s)||jsonb_build_object('plan',p);
end $$;
revoke all on function public.prepare_allocated_attempt(uuid) from public,anon,authenticated;
grant execute on function public.prepare_allocated_attempt(uuid) to service_role;
create function public.bind_standard_attempt(p_user uuid,p_attempt uuid,p_customer text,p_origin text,p_session text default null) returns public.standard_checkout_attempts language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; r public.standard_checkout_attempts;
begin
 if p_customer is null or p_customer !~ '^cus_[A-Za-z0-9]+$' or p_origin is null or p_origin !~ '^https://[a-zA-Z0-9.-]+$' or (p_session is not null and p_session !~ '^cs_test_[A-Za-z0-9]+$') then raise exception 'Invalid binding'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.offered_plan is distinct from 'standard' or a.subscription_status<>'none' or a.stripe_subscription_id is not null or (a.stripe_customer_id is not null and a.stripe_customer_id<>p_customer) then raise exception 'Account not eligible'; end if;
 select * into r from public.standard_checkout_attempts where user_id=p_user and attempt_id=p_attempt for update;
 if not found or r.state<>'reserved' or (r.bound_customer_id is not null and r.bound_customer_id<>p_customer) or (r.checkout_origin is not null and r.checkout_origin<>p_origin) or (r.stripe_session_id is not null and r.stripe_session_id is distinct from p_session) then raise exception 'Attempt mismatch'; end if;
 if p_session is not null and (r.bound_customer_id is null or r.checkout_origin is null) then raise exception 'Persist attempt first'; end if;
 update public.billing_accounts set stripe_customer_id=p_customer,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user and stripe_customer_id is null;
 update public.standard_checkout_attempts set bound_customer_id=p_customer,checkout_origin=p_origin,stripe_session_id=coalesce(p_session,stripe_session_id) where user_id=p_user returning * into r;
 return r;
end $$;
revoke all on function public.bind_standard_attempt(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.bind_standard_attempt(uuid,uuid,text,text,text) to service_role;
commit;