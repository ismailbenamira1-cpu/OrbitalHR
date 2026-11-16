// Pure entitlement calculation; not wired into production authorization.
// A verified backend must supply the account record, never client input.
export function billingEntitlement(account, now = Date.now()) {
  if (!account || account.billing_hold === true || !Number.isFinite(now)) return 'inactive';
  const paid = Date.parse(account.paid_through);
  if (account.subscription_status === 'active' && Number.isFinite(paid) && paid > now) return 'paid';
  if (account.subscription_status !== 'none') return 'inactive';
  const start = Date.parse(account.trial_started_at);
  const end = Date.parse(account.trial_ends_at);
  if (Number.isFinite(start) && Number.isFinite(end) && end - start === 240 * 3600000 && start <= now && now < end) return 'trial';
  return 'inactive';
}
