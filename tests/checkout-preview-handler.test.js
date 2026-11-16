import test from 'node:test';
import assert from 'node:assert/strict';
import {handleCheckout} from '../functions/_shared/checkout-preview-handler.js';
test('checkout disabled by default without upstream calls',async()=>{
 const r=await handleCheckout(new Request('https://preview.example.invalid/api/billing/checkout',{method:'POST'}),{},()=>{throw Error('unexpected network')});
 assert.equal(r.status,503);
});
test('checkout rejects non-staging database and live key',async()=>{
 const origin='https://preview.example.invalid';
 const env={BILLING_PREVIEW_ENABLED:'true',BILLING_PREVIEW_ORIGIN:origin,BILLING_STAGING_SUPABASE_URL:'https://other.supabase.co',BILLING_STAGING_ANON_KEY:'test',BILLING_STAGING_SERVICE_ROLE_KEY:'test',BILLING_CHECKOUT_TEST_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_fake'};
 const req=()=>new Request(origin+'/api/billing/checkout',{method:'POST'});
 const noNetwork=()=>{throw Error('unexpected network')};
 assert.equal((await handleCheckout(req(),env,noNetwork)).status,503);
 assert.equal((await handleCheckout(req(),{...env,BILLING_STAGING_SUPABASE_URL:'https://clijflnmtyqjexocbjqq.supabase.co',STRIPE_SECRET_KEY:'sk_live_fake'},noNetwork)).status,503);
});
