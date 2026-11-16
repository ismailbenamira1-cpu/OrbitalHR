-- Staging only, after transaction draft. No production execution.
begin;
alter table public.founding_reservations add column checkout_origin text,
 add column bound_customer_id text;
create function public.bind_founding_attempt(p_user uuid,p_attempt uuid,p_customer text,p_origin text,p_session text default null)
returns public.founding_reservations language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; r public.founding_reservations;
begin
 if p_customer is null or p_customer !~ '^cus_[A-Za-z0-9]+$' or p_origin is null or p_origin !~ '^https://[a-zA-Z0-9.-]+$' or (p_session is not null and p_session !~ '^cs_test_[A-Za-z0-9]+$') then raise exception 'Invalid binding'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.subscription_status<>'none' or a.stripe_subscription_id is not null or (a.stripe_customer_id is not null and a.stripe_customer_id<>p_customer) then raise exception 'Account not eligible'; end if;
 select * into r from public.founding_reservations where user_id=p_user and attempt_id=p_attempt for update;
 if not found or r.state<>'reserved' or (r.bound_customer_id is not null and r.bound_customer_id<>p_customer) or (r.checkout_origin is not null and r.checkout_origin<>p_origin) or (r.stripe_session_id is not null and r.stripe_session_id is distinct from p_session) then raise exception 'Attempt mismatch'; end if;
 if p_session is not null and (r.bound_customer_id is null or r.checkout_origin is null) then raise exception 'Persist attempt before session creation'; end if;
 update public.billing_accounts set stripe_customer_id=p_customer,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user and stripe_customer_id is null;
 update public.founding_reservations set bound_customer_id=p_customer,checkout_origin=p_origin,stripe_session_id=coalesce(p_session,stripe_session_id) where user_id=p_user returning * into r;
 return r;
end $$;
revoke all on function public.bind_founding_attempt(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.bind_founding_attempt(uuid,uuid,text,text,text) to service_role;
commit;
