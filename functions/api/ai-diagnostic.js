import { apiReply, verifySameOrigin, authorizeAi } from '../_shared/security.js';

// GET checks metadata without AI generation; POST optionally tests a tiny paid generation without employee data.
export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') return apiReply({success:false,error:'Method not allowed'},405);
  if (request.method === 'POST') {
    // This explicit one-shot diagnostic consumes one daily AI quota unit.
    // The prompt is fixed; no roster or user supplied text reaches the provider.
    const auth = await authorizeAi(request, env);
    if (auth.error) return auth.error;
    const key = env.GEMINI_API_KEY || env.API_KEY;
    if (!key) return apiReply({success:false,stage:'generation',category:'provider-config'},503);
    const model = env.GEMINI_MODEL || 'gemini-3.8-flash';
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-goog-api-key':key},
        body:JSON.stringify({
          contents:[{role:'user',parts:[{text:'Reply with the single word READY.'}]}],
          generationConfig:{maxOutputTokens:48,thinkingConfig:{thinkingLevel:'low'}}
        }),
        signal:controller.signal
      });
      const elapsedMs=Date.now()-start;
      if(!response.ok){
        let category='upstream-error';
        if([401,403].includes(response.status))category='credential-or-permission';
        else if(response.status===404)category='model-unavailable';
        else if(response.status===400)category='request-invalid';
        else if(response.status===429)category='quota-or-rate-limit';
        else if(response.status>=500)category='provider-server-error';
        return apiReply({success:false,stage:'generation',model,category,httpStatus:response.status,elapsedMs},502);
      }
      const data=await response.json();
      const candidate=data.candidates?.[0];
      const text=(candidate?.content?.parts||[]).map(part=>part.text||'').join('').trim();
      return apiReply({success:!!text,stage:'generation',model,httpStatus:200,elapsedMs,hasText:!!text,finishReason:candidate?.finishReason||'unknown',outputChars:text.length},text?200:502);
    }catch(e){
      return apiReply({success:false,stage:'generation',model,category:controller.signal.aborted?'timeout':'connection-failed',elapsedMs:Date.now()-start},503);
    }finally{clearTimeout(timer);}
  }
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
