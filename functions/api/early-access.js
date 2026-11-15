import { apiReply, readLimitedJson, verifySameOrigin } from '../_shared/security.js';

// Gate 4 staged endpoint. Activate only after the matching Turnstile site key,
// server secret and Supabase backend secret are set and direct grants are revoked.
// Neither secret may be prefixed VITE_ or returned to the client.
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return apiReply({success:false,error:'Method not allowed'},405);
  if (!verifySameOrigin(request)) return apiReply({success:false,error:'Origin not allowed'},403);
  const parsed=await readLimitedJson(request,4096);
  if(parsed.error)return parsed.error;
  const p=parsed.body && typeof parsed.body==='object' && !Array.isArray(parsed.body) ? parsed.body : {};
  const email=typeof p.work_email==='string'?p.work_email.trim().toLowerCase():'';
  const company=typeof p.company_name==='string'?p.company_name.trim():'';
  const size=typeof p.company_size==='string'?p.company_size.trim():'';
  const countries=typeof p.target_countries==='string'?p.target_countries.trim():'';
  const token=typeof p.turnstile_token==='string'?p.turnstile_token:'';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 ||
      company.length<2 || company.length>150 || !['50-100','101-250','251-500','500+'].includes(size) ||
      countries.length>300 || !p.consent)
    return apiReply({success:false,error:'Please enter valid business details and agree to contact.'},400);
  if(token.length<10 || token.length>2048)
    return apiReply({success:false,error:'Complete the bot verification before submitting.'},400);
  const secret=env.TURNSTILE_SECRET;
  const apiUrl=env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const dbKey=env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const expectedHost=env.TURNSTILE_EXPECTED_HOSTNAME || 'orbitalhr.pages.dev';
  if(!secret || !dbKey || !apiUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(apiUrl))
    return apiReply({success:false,error:'Early access registration is temporarily unavailable.'},503);
  let verified;
  try{
    const requestData={secret,response:token};
    const ip=request.headers.get('CF-Connecting-IP');
    if(ip)requestData.remoteip=ip;
    const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(requestData),signal:AbortSignal.timeout(7000)
    });
    if(!response.ok)throw new Error('challenge unavailable');
    verified=await response.json();
  }catch{
    return apiReply({success:false,error:'Verification service unavailable; please try again later.'},503);
  }
  if(verified?.success!==true || verified.action!=='early_access' || verified.hostname!==expectedHost)
    return apiReply({success:false,error:'Verification failed or expired. Please retry the challenge.'},403);
  try{
    const headers={apikey:dbKey,'Content-Type':'application/json',Prefer:'return=minimal'};
    // Legacy service_role is a JWT; modern sb_secret keys authenticate via apikey only.
    if(!dbKey.startsWith('sb_secret_'))headers.Authorization='Bearer '+dbKey;
    const res=await fetch(apiUrl.replace(/\/$/,'')+'/rest/v1/early_access_leads',{
      method:'POST',headers,
      body:JSON.stringify({work_email:email,company_name:company,company_size:size,target_countries:countries}),
      signal:AbortSignal.timeout(8000)
    });
    if(!res.ok){
      console.error('early access database insert failed', {status:res.status});
      return apiReply({success:false,error:'Could not save your request. Please retry later.'},503);
    }
    return apiReply({success:true,message:'Thanks. Your early-access request was submitted.'},201);
  }catch{
    return apiReply({success:false,error:'Registration service is temporarily unavailable.'},503);
  }
}
