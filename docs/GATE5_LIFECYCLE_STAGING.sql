begin;
create function public.suspend_billing_access(p_user uuid,p_subscription text,p_version bigint,p_status text) returns text language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts;
begin
 if p_status is null or p_status not in ('past_due','unpaid','canceled','paused') or p_subscription is null or p_version is null then raise exception 'Invalid suspension'; end if;
 select * into a from public.billing_accounts where user_id=p_user for update;
 if not found or a.stripe_subscription_id is distinct from p_subscription or a.reconciliation_version<>p_version then raise exception 'Stale or mismatched subscription'; end if;
 update public.billing_accounts set subscription_status=p_status,paid_through=null,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user;
 return 'suspended';
end $$;
revoke all on function public.suspend_billing_access(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.suspend_billing_access(uuid,text,bigint,text) to service_role;
commit;