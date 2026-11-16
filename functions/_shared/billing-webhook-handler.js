import {verifyStripeEvent} from './stripe-webhook-verify.js';
import {apiReply} from './security.js';
import {reconcileStripeInvoice} from './stripe-invoice-reconciliation.js';
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
 if(event.type!=='invoice.paid') return apiReply({error:'Event type not supported'},503);
 if(env.BILLING_RECONCILIATION_TEST_ENABLED!=='true') return apiReply({error:'Reconciliation not enabled'},503);
 try {return apiReply({result:await reconcileStripeInvoice(event,env)});} catch {return apiReply({error:'Reconciliation requires retry'},503);}
 }catch{return apiReply({error:'Invalid webhook'},400);}
}
