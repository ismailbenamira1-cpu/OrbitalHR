begin;
alter table public.billing_accounts add column billing_hold boolean not null default false;
grant select(billing_hold) on public.billing_accounts to authenticated;
create table public.billing_acceptances(user_id uuid not null references public.billing_accounts(user_id) on delete restrict,attempt_id uuid primary key,plan text not null check(plan in ('founding','standard')),terms_version text not null check(terms_version='founding-12-standard-v1'),accepted_at timestamptz not null default now());
alter table public.billing_acceptances enable row level security;
revoke all on public.billing_acceptances from public,anon,authenticated;
grant select,insert on public.billing_acceptances to service_role;
create function public.record_billing_acceptance(p_user uuid,p_attempt uuid,p_plan text,p_terms text) returns boolean language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; actual uuid;
begin
select * into a from public.billing_accounts where user_id=p_user for update;
if not found or a.billing_hold or a.offered_plan is distinct from p_plan or a.subscription_status<>'none' or p_terms is distinct from 'founding-12-standard-v1' then raise exception 'Invalid acceptance'; end if;
if p_plan='founding' then select attempt_id into actual from public.founding_reservations where user_id=p_user and state='reserved'; elsif p_plan='standard' then select attempt_id into actual from public.standard_checkout_attempts where user_id=p_user and state='reserved'; end if;
if actual is null or actual is distinct from p_attempt then raise exception 'Attempt mismatch'; end if;
insert into public.billing_acceptances(user_id,attempt_id,plan,terms_version) values(p_user,p_attempt,p_plan,p_terms) on conflict(attempt_id) do nothing;
return exists(select 1 from public.billing_acceptances where user_id=p_user and attempt_id=p_attempt and plan=p_plan and terms_version=p_terms);
end $$;
revoke all on function public.record_billing_acceptance(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.record_billing_acceptance(uuid,uuid,text,text) to service_role;
create function public.hold_billing_access(p_user uuid,p_subscription text,p_version bigint) returns text language plpgsql security invoker set search_path='' as $$
begin
update public.billing_accounts set billing_hold=true,subscription_status='paused',paid_through=null,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user and stripe_subscription_id=p_subscription and reconciliation_version=p_version;
if not found then raise exception 'Stale or mismatched subscription'; end if;
return 'suspended';
end $$;
revoke all on function public.hold_billing_access(uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.hold_billing_access(uuid,text,bigint) to service_role;
create or replace function public.has_billing_entitlement() returns boolean language sql stable security invoker set search_path='' as $$
select exists(select 1 from public.billing_accounts a where a.user_id=(select auth.uid()) and not a.billing_hold and ((a.subscription_status='active' and a.paid_through>now()) or (a.subscription_status='none' and a.trial_started_at<=now() and a.trial_ends_at>now() and a.trial_ends_at-a.trial_started_at=interval '240 hours')))
$$;
create or replace function public.apply_allocated_payment(p_event text,p_user uuid,p_customer text,p_subscription text,p_session text,p_invoice text,p_version bigint,p_plan text,p_paid_through timestamptz,p_cancel boolean) returns text language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; n integer; bound_session text;
begin
 if p_event is null or p_event !~ '^evt_[A-Za-z0-9]+$' or p_invoice is null or p_invoice !~ '^in_[A-Za-z0-9]+$' or p_subscription is null or p_subscription !~ '^sub_[A-Za-z0-9]+$' or p_session is null or p_session !~ '^cs_test_[A-Za-z0-9]+$' or p_customer is null or p_customer !~ '^cus_[A-Za-z0-9]+$' or p_plan is null or p_plan not in ('founding','standard') or p_paid_through is null or p_paid_through<=now() or p_paid_through>now()+interval '32 days' or p_cancel is null or p_version is null then raise exception 'Invalid payment'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.stripe_customer_id is distinct from p_customer or a.offered_plan is null or (a.stripe_subscription_id is not null and a.stripe_subscription_id<>p_subscription) then raise exception 'Binding mismatch'; end if;
 if a.billing_hold then raise exception 'Billing hold'; end if;
 if a.offered_plan='founding' then select stripe_session_id into bound_session from public.founding_reservations where user_id=p_user and bound_customer_id=p_customer;
 else select stripe_session_id into bound_session from public.standard_checkout_attempts where user_id=p_user and bound_customer_id=p_customer; end if;
 if bound_session is distinct from p_session then raise exception 'Checkout mismatch'; end if;
 if exists(select 1 from public.billing_paid_invoices where invoice_id=p_invoice and (user_id<>p_user or period_end<>p_paid_through or price_plan<>p_plan)) then raise exception 'Invoice mismatch'; end if;
 if exists(select 1 from public.billing_webhook_events where event_id=p_event) then
 if exists(select 1 from public.billing_paid_invoices where invoice_id=p_invoice and user_id=p_user) then return 'duplicate'; end if;
 raise exception 'Event mismatch'; end if;
 if a.reconciliation_version<>p_version then raise exception 'Stale reconciliation'; end if;
 if exists(select 1 from public.billing_paid_invoices where invoice_id=p_invoice) then insert into public.billing_webhook_events(event_id,processed_at) values(p_event,now()); return 'duplicate_invoice'; end if;
 select count(*) into n from public.billing_paid_invoices where user_id=p_user and price_plan='founding';
 if p_plan is distinct from (case when a.offered_plan='founding' and n<12 then 'founding' else 'standard' end) then raise exception 'Price mismatch'; end if;
 if a.paid_through is not null and p_paid_through<=a.paid_through then raise exception 'Non-increasing coverage'; end if;
 insert into public.billing_paid_invoices(invoice_id,user_id,period_end,price_plan) values(p_invoice,p_user,p_paid_through,p_plan);
 update public.billing_accounts set stripe_subscription_id=p_subscription,subscription_status='active',paid_through=p_paid_through,cancel_at_period_end=p_cancel,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user;
 if a.offered_plan='founding' then update public.founding_reservations set state='paid' where user_id=p_user; else update public.standard_checkout_attempts set state='paid' where user_id=p_user; end if;
 insert into public.billing_webhook_events(event_id,processed_at) values(p_event,now());
 return 'applied';
end $$;

commit;