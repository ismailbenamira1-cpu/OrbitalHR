begin;
create function public.has_billing_entitlement() returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.billing_accounts a where a.user_id=(select auth.uid()) and ((a.subscription_status='active' and a.paid_through>now()) or (a.subscription_status='none' and a.trial_started_at<=now() and a.trial_ends_at>now() and a.trial_ends_at-a.trial_started_at=interval '240 hours')))
$$;
revoke all on function public.has_billing_entitlement() from public,anon;
grant execute on function public.has_billing_entitlement() to authenticated;
-- Restrictive policies compose with existing owner policies; reads and deletes unchanged.
create policy billing_roster_insert on public.employee_rosters as restrictive for insert to authenticated with check ((select public.has_billing_entitlement()));
create policy billing_roster_update on public.employee_rosters as restrictive for update to authenticated using ((select public.has_billing_entitlement())) with check ((select public.has_billing_entitlement()));
commit;