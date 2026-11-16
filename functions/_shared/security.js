// Cloudflare Pages security gate for paid AI requests.
// Uses Supabase Auth to validate the bearer token with the auth server (never trust decoded JWT payloads).
export function apiReply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export function verifySameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Non-browser clients still require a valid bearer token.
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}
export async function readLimitedJson(request, maxBytes = 100000) {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) return { error: apiReply({ success: false, error: 'Request is too large.' }, 413) };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maxBytes) return { error: apiReply({ success: false, error: 'Request is too large.' }, 413) };
  try { return { body: JSON.parse(raw) }; } catch { return { error: apiReply({ success: false, error: 'Invalid JSON request.' }, 400) }; }
}
export async function authorizeAi(request, env) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
    return { error: apiReply({ success: false, error: 'AI authentication is not configured.' }, 503) };
  }
  if (!verifySameOrigin(request)) return { error: apiReply({ success: false, error: 'Origin not allowed.' }, 403) };
  const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(request.headers.get('authorization') || '');
  if (!match || match[1].length > 8192) return { error: apiReply({ success: false, error: 'Sign in to use Orbital AI features.' }, 401) };
  const bearer = 'Bearer ' + match[1];
  let user;
  try {
    const response = await fetch(url.replace(/\/$/, '') + '/auth/v1/user', {
      headers: { apikey: key, Authorization: bearer },
      signal: AbortSignal.timeout(7500),
    });
    if (!response.ok) return { error: apiReply({ success: false, error: 'Session expired or invalid. Sign in again.' }, 401) };
    user = await response.json();
    if (!user?.id || !user?.aud || user.aud !== 'authenticated') return { error: apiReply({ success: false, error: 'Invalid account session.' }, 401) };
  } catch {
    return { error: apiReply({ success: false, error: 'Authentication service temporarily unavailable.' }, 503) };
  }
  // Staging billing is fail-closed; production authorization remains unchanged.
  if (url.replace(/\/$/,'') === 'https://clijflnmtyqjexocbjqq.supabase.co' || env.BILLING_ENFORCEMENT_TEST_ENABLED === 'true') {
    if (url.replace(/\/$/,'') !== 'https://clijflnmtyqjexocbjqq.supabase.co' || env.BILLING_ENFORCEMENT_TEST_ENABLED !== 'true' || !user.email_confirmed_at) return {error:apiReply({success:false,error:'Billing preview unavailable.'},503)};
    try {
      const response=await fetch(url.replace(/\/$/,'')+'/rest/v1/rpc/has_billing_entitlement',{method:'POST',headers:{apikey:key,Authorization:bearer,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(7500)});
      if(!response.ok)return {error:apiReply({success:false,error:'Billing verification unavailable.'},503)};
      if(await response.json()!==true)return {error:apiReply({success:false,error:'An active trial or subscription is required.'},402)};
    }catch{return {error:apiReply({success:false,error:'Billing verification unavailable.'},503)};}
  }
  // Atomic per-user daily quota is enforced by a narrowly scoped Supabase RPC.
  try {
    const response = await fetch(url.replace(/\/$/, '') + '/rest/v1/rpc/consume_ai_daily_quota', {
      method: 'POST', headers: { apikey: key, Authorization: bearer, 'Content-Type': 'application/json' },
      body: '{}', signal: AbortSignal.timeout(7500),
    });
    if (!response.ok) return { error: apiReply({ success: false, error: 'AI usage protection is not configured.' }, 503) };
    const allowed = await response.json();
    if (allowed !== true) return { error: apiReply({ success: false, error: 'Daily AI request limit reached. Try again tomorrow.' }, 429) };
  } catch {
    return { error: apiReply({ success: false, error: 'AI usage protection temporarily unavailable.' }, 503) };
  }
  return { user: { id: user.id } };
}
