import { checkoutForm, verifyTestPrice } from './stripe-preview.js';
// Internal staging primitive. Caller must persist the immutable attempt and customer
// binding before invoking. Never expose this as an HTTP handler without reconciliation.
export async function createTestCheckout(attempt, key, fetcher = fetch, now = Date.now()) {
 if (!attempt || !/^[0-9a-f-]{36}$/i.test(attempt.attemptId || '') || !Number.isFinite(now)) throw Error('Invalid attempt');
 const created = Date.parse(attempt.createdAt);
 if (!Number.isFinite(created) || now < created || now-created >= 20*3600000) throw Error('Attempt requires reconciliation');
 if (attempt.state !== 'reserved' || attempt.subscriptionId || attempt.sessionId) throw Error('Attempt already bound');
 await verifyTestPrice(key,fetcher);
 const form=checkoutForm({userId:attempt.userId,customerId:attempt.customerId,origin:attempt.origin});
 form.set('metadata[orbital_attempt_id]',attempt.attemptId);
 form.set('subscription_data[metadata][orbital_attempt_id]',attempt.attemptId);
 const res=await fetcher('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'orbital-checkout-'+attempt.attemptId},body:form.toString(),signal:AbortSignal.timeout(10000)});
 if(!res.ok) throw Error('Checkout requires reconciliation');
 const session=await res.json();
 if(session.livemode!==false || !/^cs_test_[A-Za-z0-9]+$/.test(session.id||'') || session.customer!==attempt.customerId || session.client_reference_id!==attempt.userId || session.mode!=='subscription' || session.status!=='open' || session.metadata?.orbital_attempt_id!==attempt.attemptId) throw Error('Unexpected checkout response');
 const url=new URL(session.url);
 if(url.origin!=='https://checkout.stripe.com' || url.username || url.password) throw Error('Unexpected checkout URL');
 return {sessionId:session.id,url:url.href};
}
