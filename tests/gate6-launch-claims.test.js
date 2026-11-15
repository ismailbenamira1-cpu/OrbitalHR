import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluatePillars } from '../src/data/corridors.js';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const rules=readFileSync(new URL('../src/data/corridors.js',import.meta.url),'utf8');
const sample={homeCountry:'United States',hostRegion:'United Kingdom',role:'Individual Contributor',daysUsed:0,certificateStatus:'Not filed',visaAuthorizedDays:null,visaExtensionStatus:'Not approved'};

test('Gate 6: homepage does not promise legal compliance, exact payroll day or unimplemented automation',()=>{
 for(const claim of [
  /Keep traveling and remote employees compliant/,
  /exact day to graduate/,
  /Verified 2026 Global Tax & Visa Rules/,
  /CPT Form Automation/,
  /Custom Country Audit/,
  /to block fines/,
  /to prevent violations/,
  /currently in closed beta for enterprise accounts/
 ])assert.doesNotMatch(app,claim);
 assert.match(app,/rules require verification/i);
 assert.match(app,/Screen cross-border mobility risks/i);
 assert.match(app,/future concepts only/i);
});

test('Gate 6: risk levels cannot be read as confirmed legal clearance',()=>{
 const data=evaluatePillars(sample);
 assert.equal(data.visa.level,'OK');
 assert.match(data.visa.action,/verify actual permission and work rights/i);
 assert.match(data.pe.subRisks.pe.action,/review facts and applicable tax treaty/i);
 assert.match(data.ss.action,/verify|confirm|request/i);
 assert.doesNotMatch(data.visa.action,/^Within permitted stay\.$/);
 assert.doesNotMatch(data.ss.action,/Coverage position is in order/);
 assert.match(rules,/Internal PE policy threshold|Orbital PE policy threshold/i);
});

test('Gate 6: source-review labels are not presented as professional sign-off',()=>{
 assert.doesNotMatch(app,/Verified 2026 Global/i);
 assert.match(app,/Source reference identified · legal review pending/);
 assert.match(app,/Source\/legal review required/);
 assert.match(rules,/Source review pending/);
});

test('Gate 6: visible user notices preserve limits and AI data handling disclosure',()=>{
 assert.match(app,/Pre-launch evaluation: use fictional employee records only/);
 assert.match(app,/Screening only — not legal advice/);
 assert.match(app,/Screening-only MVP:/);
 assert.match(app,/not findings of legal breach/);
 assert.match(app,/free text and travel details may still identify people/i);
 assert.match(app,/Privacy Policy and Terms of Service: in preparation/);
 assert.match(app,/mailto:ismailbenamira1@gmail.com/);
 assert.doesNotMatch(app,/href=["']\/(privacy|terms)["']/);
});
