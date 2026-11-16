import {apiReply} from './security.js';
import {previewConfig,authenticatePreview} from './billing-preview.js';
const STAGING='https://clijflnmtyqjexocbjqq.supabase.co';
export async function handleBillingPortal(request,env,fetcher=fetch){
 try{
 const config=previewConfig(env,request),key=env.STRIPE_SECRET_KEY,portal=env.STRIPE_TEST_PORTAL_CONFIGURATION;
 if(!config||config.url!==STAGING||env.BILLING_PORTAL_TEST_ENABLED!=='true'||!/^sk_test_/.test(key||'')||!/^bpc_[A-Za-z0-9]+$/.test(portal||''))return apiReply({error:'Billing portal unavailable'},503);
 const user=await authenticatePreview(request,config,fetcher);
 if(!user)return apiReply({error:'Verified sign-in required'},401);
 const headers={apikey:config.service,Authorization:'Bearer '+config.service};
 const r=await fetcher(STAGING+'/rest/v1/billing_accounts?user_id=eq.'+encodeURIComponent(user)+'&select=stripe_customer_id,stripe_subscription_id',{headers,signal:AbortSignal.timeout(7500)});
 if(!r.ok)throw Error('Account lookup failed');
 const rows=await r.json(),a=rows?.[0];
 if(!Array.isArray(rows)||rows.length!==1||!/^cus_[A-Za-z0-9]+$/.test(a?.stripe_customer_id||'')||!/^sub_[A-Za-z0-9]+$/.test(a?.stripe_subscription_id||''))return apiReply({error:'No subscription available'},409);
 const stripeHeaders={Authorization:'Bearer '+key,'Stripe-Version':'2024-10-28.acacia'};
 const c=await fetcher('https://api.stripe.com/v1/billing_portal/configurations/'+portal,{headers:stripeHeaders,signal:AbortSignal.timeout(10000)});
 if(!c.ok)throw Error('Portal configuration unavailable');
 const p=await c.json(),f=p.features;
 if(p.id!==portal||p.livemode!==false||p.active!==true||f?.subscription_update?.enabled!==false||f?.subscription_cancel?.enabled!==true||f.subscription_cancel.mode!=='at_period_end'||f?.payment_method_update?.enabled!==true||f?.invoice_history?.enabled!==true||f?.customer_update?.enabled!==false)throw Error('Unsafe portal configuration');
 const form=new URLSearchParams({customer:a.stripe_customer_id,configuration:portal,return_url:env.BILLING_PREVIEW_ORIGIN+'/?billing=portal'});
 const res=await fetcher('https://api.stripe.com/v1/billing_portal/sessions',{method:'POST',headers:{...stripeHeaders,'Content-Type':'application/x-www-form-urlencoded'},body:form.toString(),signal:AbortSignal.timeout(10000)});
 if(!res.ok)throw Error('Portal unavailable');
 const session=await res.json(),url=new URL(session.url);
 if(session.livemode!==false||session.customer!==a.stripe_customer_id||session.configuration!==portal||url.origin!=='https://billing.stripe.com'||url.username||url.password)throw Error('Unexpected portal session');
 return apiReply({url:url.href});
 }catch{return apiReply({error:'Billing portal temporarily unavailable'},503);}
}
