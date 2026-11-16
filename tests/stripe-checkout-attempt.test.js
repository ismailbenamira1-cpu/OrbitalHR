import test from 'node:test';
import assert from 'node:assert/strict';
import {createTestCheckout} from '../functions/_shared/stripe-checkout-attempt.js';
import {PRICE,PRODUCT} from '../functions/_shared/stripe-preview.js';
const now=Date.parse('2026-11-16T12:00:00Z');
const attempt={attemptId:'12345678-1234-1234-1234-123456789abc',userId:'22345678-1234-1234-1234-123456789abc',customerId:'cus_fixture',origin:'https://preview.example',createdAt:new Date(now).toISOString(),state:'reserved'};
const price={id:PRICE,product:PRODUCT,livemode:false,active:true,currency:'cad',unit_amount:9900,type:'recurring',recurring:{interval:'month',interval_count:1,usage_type:'licensed'},billing_scheme:'per_unit'};
const session={id:'cs_test_fixture',livemode:false,customer:attempt.customerId,client_reference_id:attempt.userId,mode:'subscription',status:'open',metadata:{orbital_attempt_id:attempt.attemptId},url:'https://checkout.stripe.com/c/pay/cs_test_fixture'};
test('stable idempotency and immutable checkout parameters',async()=>{
 const calls=[];const fake=async(url,opts)=>{if(url.includes('/prices/'))return Response.json(price);calls.push(opts);return Response.json(session);};
 await createTestCheckout(attempt,'sk_test_fixture',fake,now);
 await createTestCheckout(attempt,'sk_test_fixture',fake,now+1000);
 assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
 assert.equal(calls[0].body,calls[1].body);
});
test('old or bound attempts rejected before network',async()=>{
 for(const a of [{...attempt,createdAt:new Date(now-21*3600000).toISOString()},{...attempt,sessionId:'cs_test_existing'},{...attempt,subscriptionId:'sub_existing'}]) await assert.rejects(createTestCheckout(a,'sk_test_fixture',()=>assert.fail('network'),now));
});
test('wrong customer or redirect rejected',async()=>{
 for(const s of [{...session,customer:'cus_other'},{...session,url:'https://evil.example/'}]) await assert.rejects(createTestCheckout(attempt,'sk_test_fixture',async url=>Response.json(url.includes('/prices/')?price:s),now));
});
