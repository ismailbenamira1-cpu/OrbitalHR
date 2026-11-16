begin;
alter table public.billing_paid_invoices add column price_plan text not null default 'founding' check(price_plan in ('founding','standard'));
create function public.apply_allocated_payment(p_event text,p_user uuid,p_customer text,p_subscription text,p_session text,p_invoice text,p_version bigint,p_plan text,p_paid_through timestamptz,p_cancel boolean) returns text language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; n integer; bound_session text;
begin
 if p_event is null or p_event !~ '^evt_[A-Za-z0-9]+$' or p_invoice is null or p_invoice !~ '^in_[A-Za-z0-9]+$' or p_subscription is null or p_subscription !~ '^sub_[A-Za-z0-9]+$' or p_session is null or p_session !~ '^cs_test_[A-Za-z0-9]+$' or p_customer is null or p_customer !~ '^cus_[A-Za-z0-9]+$' or p_plan is null or p_plan not in ('founding','standard') or p_paid_through is null or p_paid_through<=now() or p_paid_through>now()+interval '32 days' or p_cancel is null or p_version is null then raise exception 'Invalid payment'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.stripe_customer_id is distinct from p_customer or a.offered_plan is null or (a.stripe_subscription_id is not null and a.stripe_subscription_id<>p_subscription) then raise exception 'Binding mismatch'; end if;
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
revoke all on function public.apply_allocated_payment(text,uuid,text,text,text,text,bigint,text,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.apply_allocated_payment(text,uuid,text,text,text,text,bigint,text,timestamptz,boolean) to service_role;
revoke execute on function public.record_verified_billing_payment(text,uuid,text,text,text,bigint,timestamptz,boolean) from service_role;
commit;