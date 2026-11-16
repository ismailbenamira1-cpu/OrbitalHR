import { apiReply, verifySameOrigin } from './security.js';
import { billingEntitlement } from './billing-entitlement.js';

export function previewConfig(env, request) {
  if (env.BILLING_PREVIEW_ENABLED !== 'true' || !env.BILLING_PREVIEW_ORIGIN || new URL(request.url).origin !== env.BILLING_PREVIEW_ORIGIN || !verifySameOrigin(request)) return null;
  const url = env.BILLING_STAGING_SUPABASE_URL;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url || '') || url === (env.SUPABASE_URL || '').replace(/\/$/,'') || url === (env.VITE_SUPABASE_URL || '').replace(/\/$/,'')) return null;
  if (!env.BILLING_STAGING_ANON_KEY || !env.BILLING_STAGING_SERVICE_ROLE_KEY) return null;
  return { url, anon: env.BILLING_STAGING_ANON_KEY, service: env.BILLING_STAGING_SERVICE_ROLE_KEY };
}
export async function authenticatePreview(request, config, fetcher = fetch) {
  const bearer = request.headers.get('authorization') || '';
  if (!/^Bearer [A-Za-z0-9._~-]{1,8192}$/.test(bearer)) return null;
  const res = await fetcher(config.url + '/auth/v1/user', { headers: { apikey: config.anon, Authorization: bearer }, signal: AbortSignal.timeout(7500) });
  if (!res.ok) return null;
  const user = await res.json();
  return user.aud === 'authenticated' && user.email_confirmed_at && /^[0-9a-f-]{36}$/i.test(user.id || '') ? user.id : null;
}
export async function activateTrial(config, userId, fetcher = fetch) {
  const headers = { apikey: config.service, Authorization: 'Bearer ' + config.service, 'Content-Type': 'application/json' };
  const base = config.url + '/rest/v1/billing_accounts';
  const insert = await fetcher(base + '?on_conflict=user_id', { method:'POST', headers:{...headers, Prefer:'resolution=ignore-duplicates,return=minimal'}, body:JSON.stringify({user_id:userId}), signal:AbortSignal.timeout(7500) });
  if (!insert.ok) throw Error('activation failed');
  const res = await fetcher(base + '?user_id=eq.' + encodeURIComponent(userId) + '&select=trial_started_at,trial_ends_at,subscription_status,paid_through', {headers, signal:AbortSignal.timeout(7500)});
  if (!res.ok) throw Error('lookup failed');
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length !== 1) throw Error('account missing');
  return {...rows[0], entitlement:billingEntitlement(rows[0])};
}
export async function handleTrial(request, env, fetcher = fetch) {
  try {
    const config = previewConfig(env,request);
    if (!config) return apiReply({error:'Billing preview unavailable'},503);
    const id = await authenticatePreview(request,config,fetcher);
    if (!id) return apiReply({error:'Verified sign-in required'},401);
    return apiReply(await activateTrial(config,id,fetcher));
  } catch { return apiReply({error:'Billing temporarily unavailable'},503); }
}
