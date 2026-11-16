begin;
alter table public.billing_accounts add column offered_plan text check(offered_plan in ('founding','standard'));
create function public.allocate_billing_plan(p_user uuid) returns text language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; n integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(8675309);
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.subscription_status<>'none' or a.stripe_subscription_id is not null then raise exception 'Account not eligible'; end if;
 if a.offered_plan is not null then return a.offered_plan; end if;
 select count(*) into n from public.founding_reservations where state='paid';
 if n=10 then
 update public.billing_accounts set offered_plan='standard',reconciliation_version=reconciliation_version+1 where user_id=p_user;
 return 'standard';
 end if;
 if exists(select 1 from public.founding_reservations where user_id=p_user) or (select count(*) from public.founding_reservations)<10 then
 perform public.reserve_founding_slot(p_user);
 update public.billing_accounts set offered_plan='founding',reconciliation_version=reconciliation_version+1 where user_id=p_user;
 return 'founding';
 end if;
 return 'waitlist';
end $$;
revoke all on function public.allocate_billing_plan(uuid) from public,anon,authenticated;
grant execute on function public.allocate_billing_plan(uuid) to service_role;
commit;