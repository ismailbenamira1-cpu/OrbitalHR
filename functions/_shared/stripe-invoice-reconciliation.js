import {transitionFoundingPrice} from './founding-price-transition.js';
import {validateAllocatedInvoice} from './allocated-invoice-validation.js';
const STAGING='https://clijflnmtyqjexocbjqq.supabase.co';
const valid=(id,prefix)=>typeof id==='string'&&new RegExp('^'+prefix+'_[A-Za-z0-9]+$').test(id);
export async function reconcileStripeInvoice(event,env,fetcher=fetch) {
 if(env.BILLING_STAGING_SUPABASE_URL!==STAGING||!/^sk_test_/.test(env.STRIPE_SECRET_KEY||'')||!env.BILLING_STAGING_SERVICE_ROLE_KEY||event.livemode!==false||event.type!=='invoice.paid'||!valid(event.id,'evt')) throw Error('Invalid reconciliation context');
 const id=event.data?.object?.id;
 const customer=event.data?.object?.customer;
 if(!valid(id,'in')||!valid(customer,'cus')) throw Error('Invalid event references');
 const dbHeaders={apikey:env.BILLING_STAGING_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.BILLING_STAGING_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
 async function json(url,options){const r=await fetcher(url,{...options,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Upstream unavailable');return r.json();}
 async function row(table,filter){const rows=await json(STAGING+'/rest/v1/'+table+'?'+filter,{headers:dbHeaders});if(!Array.isArray(rows)||rows.length!==1)throw Error('Missing binding');return rows[0];}
 async function stripe(path){return json('https://api.stripe.com/v1/'+path,{headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2024-10-28.acacia'}});}
 // Capture optimistic version before retrieving current Stripe objects.
 const account=await row('billing_accounts','stripe_customer_id=eq.'+customer);
 if(!['founding','standard'].includes(account.offered_plan))throw Error('Missing allocation');
 const attempt=await row(account.offered_plan==='founding'?'founding_reservations':'standard_checkout_attempts','user_id=eq.'+encodeURIComponent(account.user_id));
 const invoice=await stripe('invoices/'+id);
 if(invoice.id!==id||invoice.customer!==customer||!valid(invoice.subscription,'sub')||!valid(invoice.charge,'ch')||invoice.paid_out_of_band!==false||invoice.collection_method!=='charge_automatically'||invoice.post_payment_credit_notes_amount!==0||!valid(attempt.stripe_session_id,'cs_test'))throw Error('Invoice not eligible');
 const subscription=await stripe('subscriptions/'+invoice.subscription);
 const session=await stripe('checkout/sessions/'+attempt.stripe_session_id);
 const charge=await stripe('charges/'+invoice.charge);
 if(charge.id!==invoice.charge||charge.livemode!==false||charge.customer!==customer||charge.invoice!==id||charge.status!=='succeeded'||charge.paid!==true||charge.captured!==true||charge.refunded!==false||charge.disputed!==false||charge.amount_refunded!==0||charge.currency!=='cad'||charge.amount_captured!==invoice.amount_paid||charge.payment_method_details?.type!=='card')throw Error('Charge not eligible');
 const args=validateAllocatedInvoice({account,attempt,session,subscription,invoice,line:invoice.lines?.data?.[0]});
 const result=await json(STAGING+'/rest/v1/rpc/apply_allocated_payment',{method:'POST',headers:dbHeaders,body:JSON.stringify({...args,p_event:event.id})});
 if(!['applied','duplicate','duplicate_invoice'].includes(result))throw Error('Unexpected reconciliation result');
 // Run on duplicate delivery too: payment may have committed before a failed Stripe update.
 if(account.offered_plan==='founding'){
 const filter='user_id=eq.'+encodeURIComponent(account.user_id);
 const paid=await json(STAGING+'/rest/v1/billing_paid_invoices?'+filter+'&price_plan=eq.founding&select=invoice_id,user_id,price_plan&limit=13',{headers:dbHeaders});
 if(!Array.isArray(paid)||paid.length>12)throw Error('Unexpected founding invoice count');
 if(paid.length===12){
 const fresh=await row('billing_accounts',filter);
 const current=await stripe('subscriptions/'+fresh.stripe_subscription_id);
 if(current.cancel_at_period_end!==true){
 if(env.BILLING_TRANSITION_TEST_ENABLED!=='true')throw Error('Price transition disabled');
 await transitionFoundingPrice({account:fresh,paidInvoices:paid,subscription:current},env.STRIPE_SECRET_KEY,fetcher);
 }
 }
 }
 return result;
}
