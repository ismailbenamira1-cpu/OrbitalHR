import {apiReply} from './security.js';
import {previewConfig,authenticatePreview} from './billing-preview.js';
import {createAllocatedCheckout} from './allocated-checkout.js';
import {BILLING_PRICES} from './billing-prices.js';
const STAGING='https://clijflnmtyqjexocbjqq.supabase.co';
async function rpc(config,name,args,fetcher) {
 const r=await fetcher(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:config.service,Authorization:'Bearer '+config.service,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(7500)});
 if(!r.ok) throw Error('Database request failed');
 const value=await r.json();
 return Array.isArray(value)?value[0]:value;
}
export async function handleCheckout(request,env,fetcher=fetch) {
 try {
 const config=previewConfig(env,request);
 const key=env.STRIPE_SECRET_KEY;
 if(!config||config.url!==STAGING||env.BILLING_CHECKOUT_TEST_ENABLED!=='true'||!/^sk_test_/.test(key||'')) return apiReply({error:'Checkout unavailable'},503);
 const user=await authenticatePreview(request,config,fetcher);
 if(!user) return apiReply({error:'Verified sign-in required'},401);
 // Explicit consent to exact offered plan, including founding transition.
 const raw=await request.text();
 if(raw.length>1024) return apiReply({error:'Invalid request'},400);
 let body;try{body=JSON.parse(raw)}catch{return apiReply({error:'Invalid request'},400)}
 if(!body||body.accepted!==true||!Object.hasOwn(BILLING_PRICES,body.plan)||body.termsVersion!=='founding-12-standard-v1') return apiReply({error:'Offer acceptance required'},400);
 const a=await rpc(config,'prepare_allocated_attempt',{p_user:user},fetcher);
 if(a?.plan==='waitlist') return apiReply({error:'Founding offers temporarily reserved'},409);
 if(!a||a.plan!==body.plan) return apiReply({error:'Offer changed; review before accepting',plan:a?.plan},409);
 if(a.state!=='reserved'||a.stripe_session_id||Date.now()-Date.parse(a.created_at)>=20*3600000) return apiReply({error:'Existing checkout requires reconciliation'},409);
 if(await rpc(config,'record_billing_acceptance',{p_user:user,p_attempt:a.attempt_id,p_plan:a.plan,p_terms:body.termsVersion},fetcher)!==true)throw Error('Acceptance not recorded');
 let customer=a.bound_customer_id;
 if(!customer){
 const form=new URLSearchParams({'metadata[orbital_user_id]':user});
 const r=await fetcher('https://api.stripe.com/v1/customers',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'orbital-customer-'+a.attempt_id},body:form.toString(),signal:AbortSignal.timeout(10000)});
 if(!r.ok) throw Error('Customer creation requires reconciliation');
 const c=await r.json();
 if(c.livemode!==false||!/^cus_[A-Za-z0-9]+$/.test(c.id||'')||c.metadata?.orbital_user_id!==user) throw Error('Unexpected customer');
 customer=c.id;
 }
 const name=a.plan==='founding'?'bind_founding_attempt':'bind_standard_attempt';
 const args={p_user:user,p_attempt:a.attempt_id,p_customer:customer,p_origin:env.BILLING_PREVIEW_ORIGIN};
 const bound=await rpc(config,name,args,fetcher);
 if(bound?.bound_customer_id!==customer||bound.checkout_origin!==args.p_origin||bound.stripe_session_id) throw Error('Binding mismatch');
 const session=await createAllocatedCheckout({plan:a.plan,attemptId:a.attempt_id,createdAt:a.created_at,state:a.state,userId:user,customerId:customer,origin:args.p_origin},key,fetcher);
 const final=await rpc(config,name,{...args,p_session:session.sessionId},fetcher);
 if(final?.stripe_session_id!==session.sessionId) throw Error('Session binding failed');
 return apiReply({url:session.url});
 } catch {return apiReply({error:'Checkout temporarily unavailable; do not retry payment outside OrbitalHR'},503);}
}
