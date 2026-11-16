import { PRICE } from './stripe-preview.js';
// Pure validation of server-fetched Stripe objects. Not a webhook handler.
// Only initial/renewal invoices with one full monthly line are supported.
export function reconcilePaidInvoice({account,subscription,invoice,line,now=Date.now()}) {
 if(!account || !subscription || !invoice || !line || !Number.isFinite(now)) throw Error('Missing reconciliation inputs');
 if(subscription.livemode!==false || invoice.livemode!==false || subscription.customer!==account.stripe_customer_id || invoice.customer!==account.stripe_customer_id || subscription.id!==account.stripe_subscription_id) throw Error('Binding mismatch');
 if(subscription.status!=='active' || invoice.status!=='paid' || invoice.currency!=='cad' || invoice.amount_paid<9900 || invoice.amount_remaining!==0 || !['subscription_create','subscription_cycle'].includes(invoice.billing_reason)) throw Error('Unsettled or unsupported invoice');
 // Normalize only after checking the pinned Stripe API version in the fetch layer.
 if(invoice.subscription!==subscription.id || line.price?.id!==PRICE || line.quantity!==1 || line.proration!==false || line.amount!==9900 || invoice.lines?.has_more!==false || invoice.lines?.data?.length!==1 || invoice.lines.data[0].id!==line.id) throw Error('Unexpected invoice line');
 const start=line.period?.start, end=line.period?.end;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||end<=start||end-start>32*86400||end-start<27*86400||start*1000>now||end*1000<=now) throw Error('Invalid coverage period');
 return {subscription_status:'active',paid_through:new Date(end*1000).toISOString(),cancel_at_period_end:subscription.cancel_at_period_end===true};
}
