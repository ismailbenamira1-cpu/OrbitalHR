-- STAGING ONLY: do not apply to production. No existing policies changed.
begin;
create table public.billing_accounts (
 user_id uuid primary key references auth.users(id) on delete restrict,
 trial_started_at timestamptz not null default now(),
 trial_ends_at timestamptz not null default (now() + interval '240 hours'),
 stripe_customer_id text unique,
 stripe_subscription_id text unique,
 subscription_status text not null default 'none' check (subscription_status in ('none','incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
 paid_through timestamptz,
 cancel_at_period_end boolean not null default false,
 updated_at timestamptz not null default now(),
 check (trial_ends_at = trial_started_at + interval '240 hours')
);
alter table public.billing_accounts enable row level security;
revoke all on public.billing_accounts from public, anon, authenticated;
grant select (user_id,trial_started_at,trial_ends_at,subscription_status,paid_through,cancel_at_period_end) on public.billing_accounts to authenticated;
grant select,insert,update,delete on public.billing_accounts to service_role;
create policy billing_read_own on public.billing_accounts for select to authenticated using ((select auth.uid()) = user_id);
create table public.billing_webhook_events (
 event_id text primary key,
 received_at timestamptz not null default now(),
 processed_at timestamptz
);
alter table public.billing_webhook_events enable row level security;
revoke all on public.billing_webhook_events from public,anon,authenticated;
grant select,insert,update,delete on public.billing_webhook_events to service_role;
commit;
