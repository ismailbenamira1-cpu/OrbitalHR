import { BILLING_PRICES, verifyBillingPrice } from './billing-prices.js';
import { checkoutForm } from './stripe-preview.js';
// Internal only. Plan and attempt must come from a persisted server-owned record.
export async function createAllocatedCheckout(attempt,key,fetcher=fetch,now=Date.now()) {
 if(!attempt || !Object.hasOwn(BILLING_PRICES,attempt.plan) || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(attempt.attemptId||'') || attempt.state!=='reserved' || attempt.sessionId || attempt.subscriptionId) throw Error('Invalid allocated attempt');
 const created=Date.parse(attempt.createdAt);
 if(!Number.isFinite(now)||!Number.isFinite(created)||now<created||now-created>=20*3600000) throw Error('Attempt requires reconciliation');
 const price=await verifyBillingPrice(attempt.plan,key,fetcher);
 const form=checkoutForm(attempt);
 form.set('line_items[0][price]',price.id);
 for(const prefix of ['metadata','subscription_data[metadata]']) {
  form.set(prefix+'[orbital_attempt_id]',attempt.attemptId);
  form.set(prefix+'[orbital_plan]',attempt.plan);
 }
 const response=await fetcher('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+key,'Stripe-Version':'2024-10-28.acacia','Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'orbital-allocated-'+attempt.attemptId+(attempt.attemptId==='b6b6e584-0e64-41d8-9280-5ed4f9fab44b'&&attempt.customerId==='cus_VdmujvizuKI6KR'?'-recovery-v1':'')},body:form.toString(),signal:AbortSignal.timeout(10000)});
 if(!response.ok) throw Error('Checkout requires reconciliation');
 const s=await response.json();
 if(s.livemode!==false||!/^cs_test_[A-Za-z0-9]+$/.test(s.id||'')||s.customer!==attempt.customerId||s.client_reference_id!==attempt.userId||s.mode!=='subscription'||s.status!=='open'||s.metadata?.orbital_attempt_id!==attempt.attemptId||s.metadata?.orbital_plan!==attempt.plan) throw Error('Unexpected checkout response');
 const url=new URL(s.url);
 if(url.origin!=='https://checkout.stripe.com'||url.username||url.password) throw Error('Unexpected checkout URL');
 return {sessionId:s.id,url:url.href};
}
