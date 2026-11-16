import {BILLING_PRICES,verifyBillingPrice} from './billing-prices.js';
// Called only after durable reconciliation of the twelfth distinct paid founding invoice.
// Never infer eligibility from elapsed calendar time.
export async function transitionFoundingPrice({account,paidInvoices,subscription},key,fetcher=fetch,now=Date.now()){
 if(!/^sk_test_/.test(key||'')||account?.offered_plan!=='founding'||!Array.isArray(paidInvoices)||paidInvoices.length!==12||new Set(paidInvoices.map(x=>x.invoice_id)).size!==12||paidInvoices.some(x=>x.user_id!==account.user_id||x.price_plan!=='founding')||account.subscription_status!=='active'||subscription?.livemode!==false||subscription.id!==account.stripe_subscription_id||subscription.customer!==account.stripe_customer_id||subscription.status!=='active'||subscription.cancel_at_period_end!==false||subscription.cancel_at||subscription.schedule||subscription.pending_update||subscription.pause_collection)throw Error('Transition requires review');
 const item=subscription.items?.data?.[0];
 const end=Date.parse(account.paid_through);
 if(subscription.items?.has_more!==false||subscription.items.data.length!==1||!/^si_[A-Za-z0-9]+$/.test(item?.id||'')||item.quantity!==1||!Number.isFinite(end)||end!==subscription.current_period_end*1000||end-now<86400000)throw Error('Unsafe transition window');
 if(item.price?.id===BILLING_PRICES.standard.id)return 'already_transitioned';
 if(item.price?.id!==BILLING_PRICES.founding.id)throw Error('Unexpected price');
 await verifyBillingPrice('standard',key,fetcher);
 const body=new URLSearchParams({'items[0][id]':item.id,'items[0][price]':BILLING_PRICES.standard.id,'items[0][quantity]':'1',proration_behavior:'none',billing_cycle_anchor:'unchanged',payment_behavior:'error_if_incomplete'});
 const r=await fetcher('https://api.stripe.com/v1/subscriptions/'+subscription.id,{method:'POST',headers:{Authorization:'Bearer '+key,'Stripe-Version':'2024-10-28.acacia','Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'orbital-transition-'+subscription.id},body:body.toString(),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('Transition requires reconciliation');
 const s=await r.json();
 if(s.id!==subscription.id||s.livemode!==false||s.customer!==subscription.customer||s.current_period_end!==subscription.current_period_end||s.billing_cycle_anchor!==subscription.billing_cycle_anchor||s.items?.data?.length!==1||s.items.data[0].price?.id!==BILLING_PRICES.standard.id||s.cancel_at_period_end!==false)throw Error('Unexpected transition result');
 return 'transitioned';
}
