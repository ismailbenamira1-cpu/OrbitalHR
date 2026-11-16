-- Isolated staging review only. Apply after foundation and reservations.
begin;
alter table public.billing_accounts add column reconciliation_version bigint not null default 0;
create table public.billing_paid_invoices (
 invoice_id text primary key,
 user_id uuid not null references public.billing_accounts(user_id) on delete restrict,
 period_end timestamptz not null,
 unique(user_id,period_end)
);
alter table public.billing_paid_invoices enable row level security;
revoke all on public.billing_paid_invoices from public,anon,authenticated;
grant select,insert,update,delete on public.billing_paid_invoices to service_role;
-- Only trusted backend after fetching and validating current Stripe state.
-- Optimistic version must be captured BEFORE fetching Stripe state.
create function public.record_verified_billing_payment(
 p_event text,p_user uuid,p_customer text,p_subscription text,p_invoice text,
 p_expected_version bigint,p_paid_through timestamptz,p_cancel boolean
) returns text language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; n integer;
begin
 if p_event is null or p_event !~ '^evt_[A-Za-z0-9]+$' or p_invoice is null or p_invoice !~ '^in_[A-Za-z0-9]+$' or p_paid_through is null or p_paid_through <= now() or p_paid_through > now()+interval '32 days' or p_cancel is null or p_expected_version is null then raise exception 'Invalid payment'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.stripe_customer_id is distinct from p_customer or a.stripe_subscription_id is distinct from p_subscription or p_customer is null or p_subscription is null then raise exception 'Binding mismatch'; end if;
 if exists(select 1 from public.billing_webhook_events where event_id=p_event and processed_at is not null) then return 'duplicate'; end if;
 if a.reconciliation_version <> p_expected_version then raise exception 'Stale reconciliation'; end if;
 if not exists(select 1 from public.founding_reservations where user_id=p_user and state in ('reserved','paid') and stripe_session_id is not null) then raise exception 'Missing checkout binding'; end if;
 if exists(select 1 from public.billing_paid_invoices where invoice_id=p_invoice and (user_id<>p_user or period_end<>p_paid_through)) then raise exception 'Invoice binding mismatch'; end if;
 if exists(select 1 from public.billing_paid_invoices where invoice_id=p_invoice) then
   insert into public.billing_webhook_events(event_id,processed_at) values(p_event,now());
   return 'duplicate_invoice';
 end if;
 if a.paid_through is not null and p_paid_through <= a.paid_through then raise exception 'Non-increasing coverage'; end if;
 select count(*) into n from public.billing_paid_invoices where user_id=p_user;
 if n>=12 then raise exception 'Introductory limit reached; reconcile pricing before further billing'; end if;
 insert into public.billing_paid_invoices(invoice_id,user_id,period_end) values(p_invoice,p_user,p_paid_through);
 update public.billing_accounts set subscription_status='active',paid_through=p_paid_through,cancel_at_period_end=p_cancel,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user;
 update public.founding_reservations set state='paid' where user_id=p_user;
 insert into public.billing_webhook_events(event_id,processed_at) values(p_event,now());
 return 'applied';
end $$;
revoke all on function public.record_verified_billing_payment(text,uuid,text,text,text,bigint,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.record_verified_billing_payment(text,uuid,text,text,text,bigint,timestamptz,boolean) to service_role;
commit;
