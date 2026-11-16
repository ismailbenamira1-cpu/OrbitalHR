export const PRODUCT_ID = 'prod_VdhlAIflvgb65d';
export const BILLING_PRICES = Object.freeze({
 founding: Object.freeze({id:'price_1UcQMJIEs4l1GGbeywZzSdL9',amount:9900}),
 standard: Object.freeze({id:'price_1UcR4eIEs4l1GGbemdcSWzcF',amount:14900})
});
export async function verifyBillingPrice(plan,key,fetcher=fetch) {
 const price=Object.hasOwn(BILLING_PRICES,plan)?BILLING_PRICES[plan]:null;
 if(!price || typeof key!=='string' || !key.startsWith('sk_test_')) throw new Error('Invalid test billing configuration');
 const response=await fetcher('https://api.stripe.com/v1/prices/'+price.id,{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(7500)});
 if(!response.ok) throw new Error('Price verification failed');
 const p=await response.json();
 if(p.id!==price.id || p.product!==PRODUCT_ID || p.livemode!==false || p.active!==true || p.currency!=='cad' || p.unit_amount!==price.amount || p.type!=='recurring' || p.billing_scheme!=='per_unit' || p.recurring?.interval!=='month' || p.recurring?.interval_count!==1 || p.recurring?.usage_type!=='licensed') throw new Error('Unexpected Stripe price');
 return price;
}
