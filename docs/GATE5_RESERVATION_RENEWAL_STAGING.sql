begin;
-- Only release reservations that have never reached Stripe session creation.
-- Checkout binding must occur before any session creation; lock ordering matches allocation.
create function public.release_unstarted_founding(p_user uuid,p_attempt uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare a public.billing_accounts; r public.founding_reservations;
begin
perform pg_catalog.pg_advisory_xact_lock(8675309);
select * into a from public.billing_accounts where user_id=p_user for update;
if not found or a.offered_plan is distinct from 'founding' or a.subscription_status<>'none' or a.stripe_subscription_id is not null or a.stripe_customer_id is not null or a.billing_hold then return false; end if;
select * into r from public.founding_reservations where user_id=p_user and attempt_id=p_attempt for update;
if not found or r.state<>'reserved' or r.created_at>now()-interval '20 hours' or r.bound_customer_id is not null or r.checkout_origin is not null or r.stripe_session_id is not null or exists(select 1 from public.billing_acceptances where attempt_id=p_attempt) then return false; end if;
delete from public.founding_reservations where attempt_id=p_attempt;
update public.billing_accounts set offered_plan=null,reconciliation_version=reconciliation_version+1,updated_at=now() where user_id=p_user;
return true;
end $$;
revoke all on function public.release_unstarted_founding(uuid,uuid) from public,anon,authenticated;
grant execute on function public.release_unstarted_founding(uuid,uuid) to service_role;
create table public.billing_transition_tasks(user_id uuid primary key references public.billing_accounts(user_id) on delete restrict,subscription_id text not null unique,created_at timestamptz not null default now(),due_at timestamptz not null,notice_sent_at timestamptz,completed_at timestamptz);
alter table public.billing_transition_tasks enable row level security;
revoke all on public.billing_transition_tasks from public,anon,authenticated;
grant select,insert,update on public.billing_transition_tasks to service_role;
create function public.queue_founding_transition() returns trigger language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
if new.price_plan='founding' then
select count(*) into n from public.billing_paid_invoices where user_id=new.user_id and price_plan='founding';
if n=12 then
-- Account subscription already bound by prior paid invoices.
insert into public.billing_transition_tasks(user_id,subscription_id,due_at)
select user_id,stripe_subscription_id,new.period_end from public.billing_accounts where user_id=new.user_id
on conflict(user_id) do nothing;
end if;
end if;
return new;
end $$;
revoke all on function public.queue_founding_transition() from public,anon,authenticated;
grant execute on function public.queue_founding_transition() to service_role;
create trigger queue_founding_transition after insert on public.billing_paid_invoices for each row execute function public.queue_founding_transition();
commit;