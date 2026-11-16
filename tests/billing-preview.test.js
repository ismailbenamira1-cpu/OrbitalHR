import test from 'node:test';
import assert from 'node:assert/strict';
import { handleTrial, activateTrial } from '../functions/_shared/billing-preview.js';
import { verifyTestPrice, checkoutForm, PRICE, PRODUCT } from '../functions/_shared/stripe-preview.js';
test('disabled preview never calls upstream', async()=> {
 const r=await handleTrial(new Request('https://preview.example/api/billing/trial',{method:'POST'}),{},()=>{throw Error('unexpected')});
 assert.equal(r.status,503);
});
test('activation ignores duplicate account instead of resetting trial',async()=>{
 const calls=[];const config={url:'https://staging.supabase.co',service:'fake'};
 const id='12345678-1234-1234-1234-123456789abc';
 const result=await activateTrial(config,id,async(url,opts)=>{calls.push({url,opts});return calls.length===1?new Response(null,{status:201}):Response.json([{trial_started_at:'2026-01-01T00:00:00Z',trial_ends_at:'2026-01-11T00:00:00Z',subscription_status:'none'}]);});
 assert.match(calls[0].opts.headers.Prefer,/ignore-duplicates/);
 assert.deepEqual(JSON.parse(calls[0].opts.body),{user_id:id});
 assert.equal(result.trial_started_at,'2026-01-01T00:00:00Z');
});
test('reject live keys and mismatched price',async()=>{
 await assert.rejects(verifyTestPrice('sk_live_fake',()=>{throw Error('unexpected')}));
 await assert.rejects(verifyTestPrice('sk_test_fake',async()=>Response.json({id:PRICE,product:PRODUCT,livemode:true})));
});
test('checkout form uses fixed price and no Stripe trial',()=>{
 const form=checkoutForm({userId:'12345678-1234-1234-1234-123456789abc',customerId:'cus_test',origin:'https://preview.example'});
 assert.equal(form.get('line_items[0][price]'),PRICE);
 assert.equal(form.get('mode'),'subscription');
 assert.equal(form.has('subscription_data[trial_period_days]'),false);
});
