import {verifyStripeEvent} from './stripe-webhook-verify.js';
import {apiReply} from './security.js';
// Verification-only endpoint: never acknowledge a valid event as processed until
// durable reconciliation is implemented. Stripe retries non-2xx responses.
export async function handleBillingWebhook(request,env) {
 if(env.BILLING_WEBHOOK_TEST_ENABLED!=='true'||env.BILLING_STAGING_SUPABASE_URL!=='https://clijflnmtyqjexocbjqq.supabase.co'||!/^sk_test_/.test(env.STRIPE_SECRET_KEY||'')||new URL(request.url).origin!==env.BILLING_PREVIEW_ORIGIN) return apiReply({error:'Webhook unavailable'},503);
 try {
 const reader=request.body?.getReader();
 if(!reader) return apiReply({error:'Missing body'},400);
 const chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();return apiReply({error:'Payload too large'},413);}chunks.push(value);}
 const raw=new Uint8Array(size);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}
 const event=await verifyStripeEvent(raw,request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET);
 if(!event)return apiReply({error:'Invalid signature'},400);
 return apiReply({error:'Reconciliation not enabled'},503);
 }catch{return apiReply({error:'Invalid webhook'},400);}
}
