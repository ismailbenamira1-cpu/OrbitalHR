import { apiReply, verifySameOrigin } from '../_shared/security.js';

// Read-only, authenticated connectivity diagnostic. No AI generation or employee data.
export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return apiReply({success:false,error:'Method not allowed'},405);
  if (!verifySameOrigin(request)) return apiReply({success:false,error:'Origin not allowed'},403);
  const url=env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anon=env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if(!url || !anon || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
    return apiReply({success:false,stage:'auth-config',error:'Authentication configuration unavailable'},503);
  const match=/^Bearer ([A-Za-z0-9._~-]+)$/.exec(request.headers.get('authorization') || '');
  if (!match || match[1].length>8192) return apiReply({success:false,error:'Sign in to check AI connectivity'},401);
  let authenticated=false;
  try {
    const res=await fetch(url.replace(/\/$/,'')+'/auth/v1/user',{
      headers:{apikey:anon,Authorization:'Bearer '+match[1]},
      signal:AbortSignal.timeout(7500)
    });
    if(res.ok){ const user=await res.json(); authenticated=!!user?.id && user.aud==='authenticated'; }
  }catch {return apiReply({success:false,stage:'auth',error:'Authentication service unavailable'},503);}
  if(!authenticated)return apiReply({success:false,error:'Invalid account session'},401);
  const key=env.GEMINI_API_KEY || env.API_KEY;
  if(!key)return apiReply({success:false,stage:'provider-config',error:'Gemini key is not configured in Cloudflare'},503);
  const model=env.GEMINI_MODEL || 'gemini-3.8-flash';
  // A metadata GET, not generateContent: no employee details, no billable generation.
  const start=Date.now();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try {
    const result=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model),{
      method:'GET',headers:{'x-goog-api-key':key},signal:controller.signal
    });
    const ms=Date.now()-start;
    if(result.ok)return apiReply({success:true,stage:'model-metadata',model,httpStatus:result.status,elapsedMs:ms,detail:'Cloudflare can reach the Gemini model metadata API. This does not verify generation speed or output.'});
    let category='upstream-error';
    if(result.status===401 || result.status===403)category='credential-or-permission';
    if(result.status===404)category='model-unavailable';
    if(result.status===429)category='quota-or-rate-limit';
    // Never send upstream response bodies, which could reveal project or account metadata.
    return apiReply({success:false,stage:'model-metadata',category,model,httpStatus:result.status,elapsedMs:ms},502);
  }catch(e){
    return apiReply({success:false,stage:'model-metadata',category:controller.signal.aborted?'timeout':'connection-failed',model,elapsedMs:Date.now()-start},503);
  }finally{clearTimeout(timer);}
}
