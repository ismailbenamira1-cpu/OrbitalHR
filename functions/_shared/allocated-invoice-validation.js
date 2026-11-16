import {BILLING_PRICES} from './billing-prices.js';
// Normalized Stripe objects must be fetched server-side, not taken from webhook payload.
export function validateAllocatedInvoice({account,attempt,session,subscription,invoice,line,now=Date.now()}) {
 if(!account||!attempt||!session||!subscription||!invoice||!line||!Number.isFinite(now)) throw Error('Missing reconciliation data');
 const customer=account.stripe_customer_id;
 const user=account.user_id;
 if(!customer||attempt.bound_customer_id!==customer||session.id!==attempt.stripe_session_id||session.customer!==customer||session.client_reference_id!==user||session.mode!=='subscription'||session.status!=='complete'||session.payment_status!=='paid'||session.metadata?.orbital_attempt_id!==attempt.attempt_id||session.metadata?.orbital_plan!==account.offered_plan) throw Error('Checkout mismatch');
 if([session,subscription,invoice].some(x=>x.livemode!==false)||subscription.customer!==customer||invoice.customer!==customer||session.subscription!==subscription.id||invoice.subscription!==subscription.id||(account.stripe_subscription_id&&account.stripe_subscription_id!==subscription.id)||subscription.status!=='active'||subscription.metadata?.orbital_user_id!==user||subscription.metadata?.orbital_attempt_id!==attempt.attempt_id) throw Error('Subscription mismatch');
 const plan=Object.keys(BILLING_PRICES).find(k=>BILLING_PRICES[k].id===line.price?.id);
 if(!plan||invoice.status!=='paid'||invoice.paid!==true||invoice.currency!=='cad'||invoice.amount_remaining!==0||invoice.amount_paid<BILLING_PRICES[plan].amount||!['subscription_create','subscription_cycle'].includes(invoice.billing_reason)||line.quantity!==1||line.proration!==false||line.amount!==BILLING_PRICES[plan].amount||invoice.lines?.has_more!==false||invoice.lines?.data?.length!==1||invoice.lines.data[0].id!==line.id) throw Error('Invoice mismatch');
 const start=line.period?.start,end=line.period?.end;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end-start<27*86400||end-start>32*86400||start*1000>now||end*1000<=now||typeof subscription.cancel_at_period_end!=='boolean') throw Error('Invalid coverage');
 return {p_user:user,p_customer:customer,p_subscription:subscription.id,p_session:session.id,p_invoice:invoice.id,p_version:account.reconciliation_version,p_plan:plan,p_paid_through:new Date(end*1000).toISOString(),p_cancel:subscription.cancel_at_period_end};
}
