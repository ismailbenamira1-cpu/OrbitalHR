// Test-only Stripe primitives. No public checkout endpoint until reservations,
// duplicate prevention and webhook reconciliation are implemented.
export const PRODUCT = 'prod_VdhlAIflvgb65d';
export const PRICE = 'price_1UcQMJIEs4l1GGbeywZzSdL9';
export async function verifyTestPrice(key, fetcher = fetch) {
  if (!/^sk_test_/.test(key || '')) throw Error('Test key required');
  const res = await fetcher('https://api.stripe.com/v1/prices/' + PRICE, {headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(7500)});
  if (!res.ok) throw Error('Price lookup failed');
  const p = await res.json();
  if (p.id !== PRICE || p.product !== PRODUCT || p.livemode !== false || p.active !== true || p.currency !== 'cad' || p.unit_amount !== 9900 || p.type !== 'recurring' || p.recurring?.interval !== 'month' || p.recurring?.interval_count !== 1 || p.recurring?.usage_type !== 'licensed' || p.billing_scheme !== 'per_unit') throw Error('Unexpected price configuration');
  return p.id;
}
export function checkoutForm({userId,customerId,origin}) {
  if (!/^[0-9a-f-]{36}$/i.test(userId || '') || !/^cus_[A-Za-z0-9]+$/.test(customerId || '') || new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw Error('Invalid server-owned checkout inputs');
  return new URLSearchParams({mode:'subscription',customer:customerId,client_reference_id:userId,'line_items[0][price]':PRICE,'line_items[0][quantity]':'1','payment_method_types[0]':'card','adaptive_pricing[enabled]':'false','subscription_data[metadata][orbital_user_id]':userId,success_url:origin+'/?billing=returned',cancel_url:origin+'/?billing=canceled'});
}
