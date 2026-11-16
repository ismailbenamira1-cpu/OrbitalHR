import {apiReply} from './security.js';
import {previewConfig,authenticatePreview,activateTrial} from './billing-preview.js';
export async function handleOffer(request,env,fetcher=fetch){
 try{
 const config=previewConfig(env,request);
 if(!config||config.url!=='https://clijflnmtyqjexocbjqq.supabase.co'||env.BILLING_OFFER_TEST_ENABLED!=='true')return apiReply({error:'Offer unavailable'},503);
 const user=await authenticatePreview(request,config,fetcher);
 if(!user)return apiReply({error:'Verified sign-in required'},401);
 const account=await activateTrial(config,user,fetcher);
 if(account.subscription_status!=='none')return apiReply({error:'Existing subscription'},409);
 const r=await fetcher(config.url+'/rest/v1/rpc/allocate_billing_plan',{method:'POST',headers:{apikey:config.service,'Content-Type':'application/json'},body:JSON.stringify({p_user:user}),signal:AbortSignal.timeout(7500)});
 if(!r.ok)throw Error('Allocation unavailable');
 const plan=await r.json();
 if(!['founding','standard','waitlist'].includes(plan))throw Error('Invalid allocation');
 return apiReply({plan,termsVersion:'founding-12-standard-v1'});
 }catch{return apiReply({error:'Offer temporarily unavailable'},503);}
}
