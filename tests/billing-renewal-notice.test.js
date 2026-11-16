import test from 'node:test';
import assert from 'node:assert/strict';
import {renewalNotice} from '../functions/_shared/billing-renewal-notice.js';
test('renewal notice contains exact prices, date and cancellation route',()=>{
 const n=renewalNotice({dueAt:'2027-12-01T00:00:00Z',origin:'https://preview.example.com'});
 for(const value of ['CAD $99/month','CAD $149/month','2027-12-01','cancel before renewal','https://preview.example.com/'])assert.ok(n.text.includes(value));
});
test('reject invalid date or unsafe origin',()=>{
 assert.throws(()=>renewalNotice({dueAt:'invalid',origin:'https://preview.example.com'}));
 assert.throws(()=>renewalNotice({dueAt:'2027-12-01',origin:'http://preview.example.com'}));
});
