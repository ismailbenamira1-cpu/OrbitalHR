import {transitionFoundingPrice} from './founding-price-transition.js';
const STAGING='https://clijflnmtyqjexocbjqq.supabase.co';
// Internal maintenance runner. No public route; invoke only from a trusted scheduler.
export async function runBillingMaintenance(env,fetcher=fetch,now=Date.now()){
 if(env.BILLING_MAINTENANCE_TEST_ENABLED!=='true'||env.BILLING_STAGING_SUPABASE_URL!==STAGING||!/^sk_test_/.test(env.STRIPE_SECRET_KEY||'')||!env.BILLING_STAGING_SERVICE_ROLE_KEY||!Number.isFinite(now))throw Error('Maintenance unavailable');
 const headers={apikey:env.BILLING_STAGING_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.BILLING_STAGING_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
 async function json(url,options){const r=await fetcher(url,{...options,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Upstream unavailable');return r.json();}
 const db=(path,options={})=>json(STAGING+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers}});
 const stripe=path=>json('https://api.stripe.com/v1/'+path,{headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2024-10-28.acacia'}});
 const report={released:0,protected:0,transitioned:0,needsNotice:0,needsReview:0,errors:0};
 const cutoff=encodeURIComponent(new Date(now-20*3600000).toISOString());
 const reservations=await db('founding_reservations?state=eq.reserved&created_at=lte.'+cutoff+'&bound_customer_id=is.null&stripe_session_id=is.null&select=user_id,attempt_id&limit=10');
 for(const r of reservations){try{const released=await db('rpc/release_unstarted_founding',{method:'POST',body:JSON.stringify({p_user:r.user_id,p_attempt:r.attempt_id})});if(released===true)report.released++;else report.protected++;}catch{report.errors++;}}
 const tasks=await db('billing_transition_tasks?completed_at=is.null&order=due_at.asc&limit=10');
 for(const t of tasks){try{
 if(!/^sub_[A-Za-z0-9]+$/.test(t.subscription_id)||!Number.isFinite(Date.parse(t.due_at))){report.needsReview++;continue;}
 const filter='user_id=eq.'+encodeURIComponent(t.user_id);
 const accounts=await db('billing_accounts?'+filter);
 const a=accounts[0];
 if(accounts.length!==1||a.billing_hold||a.stripe_subscription_id!==t.subscription_id||a.subscription_status!=='active'){report.needsReview++;continue;}
 const s=await stripe('subscriptions/'+t.subscription_id);
 if(s.id!==t.subscription_id||s.customer!==a.stripe_customer_id||s.livemode!==false){report.needsReview++;continue;}
 if(s.cancel_at_period_end||s.cancel_at||s.status!=='active'){report.needsReview++;continue;}
 // Do not initiate a price change until a verified notice is recorded.
 if(!t.notice_sent_at){report.needsNotice++;continue;}
 if(Date.parse(t.notice_sent_at)>now||Date.parse(t.due_at)-now<86400000){report.needsReview++;continue;}
 const invoices=await db('billing_paid_invoices?'+filter+'&price_plan=eq.founding&select=invoice_id,user_id,price_plan&limit=13');
 const result=await transitionFoundingPrice({account:a,paidInvoices:invoices,subscription:s},env.STRIPE_SECRET_KEY,fetcher,now);
 if(!['transitioned','already_transitioned'].includes(result))throw Error('Unexpected transition');
 const updated=await db('billing_transition_tasks?'+filter+'&subscription_id=eq.'+t.subscription_id+'&completed_at=is.null',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({completed_at:new Date(now).toISOString()})});
 if(updated.length!==1)throw Error('Task completion conflict');
 report.transitioned++;
 }catch{report.errors++;}}
 return report;
}
