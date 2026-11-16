import test from 'node:test';
import assert from 'node:assert/strict';
import { billingEntitlement } from '../functions/_shared/billing-entitlement.js';
const start = Date.parse('2026-11-16T00:00:00Z');
const end = start + 240 * 3600000;
const trial = { trial_started_at: new Date(start).toISOString(), trial_ends_at: new Date(end).toISOString(), subscription_status: 'none' };
test('trial exact boundaries', () => {
 assert.equal(billingEntitlement(trial,start-1),'inactive');
 assert.equal(billingEntitlement(trial,start),'trial');
 assert.equal(billingEntitlement(trial,end-1),'trial');
 assert.equal(billingEntitlement(trial,end),'inactive');
});
test('paid requires active status and future paid-through', () => {
 const account = {...trial, subscription_status:'active', paid_through:new Date(end+1000).toISOString()};
 assert.equal(billingEntitlement(account,end),'paid');
 assert.equal(billingEntitlement(account,end+1000),'inactive');
 assert.equal(billingEntitlement({...account,subscription_status:'past_due'},end),'inactive');
});
test('missing or malformed records fail closed', () => {
 assert.equal(billingEntitlement(null,start),'inactive');
 assert.equal(billingEntitlement({...trial,trial_ends_at:'bad'},start),'inactive');
});
