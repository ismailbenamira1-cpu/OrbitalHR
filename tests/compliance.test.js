import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOMES, HOSTS, PILLARS, buildMatrix, evaluatePillars, hostSummary } from '../src/data/corridors.js';
import { evaluateEmployee } from '../src/data/evaluateEmployee.js';
import { reportingEmployee, buildComplianceCsv, csvCell } from '../src/data/reporting.js';

const employee = (overrides = {}) => ({ name: 'Example', homeCountry: 'United States', hostRegion: 'United Kingdom', role: 'Individual Contributor', daysUsed: 0, currentSetup: 'EOR ($599/mo)', certificateStatus: 'Not filed', ...overrides });
const evaluate = e => evaluateEmployee(e, [e], 599, 55);
const roles = ['Individual Contributor','Manager / Team Lead','Sales / Revenue','Executive'];
const levels = ['OK','WATCH','CRITICAL','BREACH'];

test('42 unique matrix cells', () => {
  const cells = buildMatrix();
  assert.equal(cells.length, 42);
  assert.equal(new Set(cells.map(c => [c.home,c.host,c.pillar].join('|'))).size, 42);
});
for (const homeCountry of HOMES) for (const [hostRegion,max] of [['Thailand',60],['Philippines',59],['Indonesia',60]]) {
  test(homeCountry+' / '+hostRegion+' extension requires valid approval', () => {
    for (const [visaExtensionStatus,visaExtendedDays,expected] of [['Not approved',null,30],['Pending',max,30],['Denied',max,30],['Approved',null,30],['Approved',max+1,30],['Approved',max,max]]) {
      const p = evaluatePillars(employee({homeCountry,hostRegion,daysUsed:30,visaAuthorizedDays:30,visaExtensionStatus,visaExtendedDays})).visa;
      assert.equal(p.limit,expected);
      assert.equal(p.extensionApproved,expected===max);
    }
  });
}
test('Mexico requires actual entry grant', () => {
  for (const visaAuthorizedDays of [null,181]) {
    const p=evaluatePillars(employee({hostRegion:'Mexico',visaAuthorizedDays})).visa;
    assert.equal(p.limit,null); assert.equal(p.level,'WATCH');
  }
  assert.equal(evaluatePillars(employee({hostRegion:'Mexico',visaAuthorizedDays:20})).visa.limit,20);
});
const noTreaty = [['United States','Mexico'],['United States','India'],['United States','Philippines'],['United States','Thailand'],['United States','Indonesia'],['Canada','Thailand'],['Canada','Indonesia']];
for (const [homeCountry,hostRegion] of noTreaty) test(homeCountry+' / '+hostRegion+' day-one SS escalation',()=>{
  for (const certificateStatus of ['Not filed','Filed','Issued']) for (const [daysUsed,level] of [[0,'OK'],[1,'WATCH'],[29,'WATCH'],[30,'CRITICAL'],[59,'CRITICAL'],[60,'BREACH']]) {
    const p=evaluatePillars(employee({homeCountry,hostRegion,certificateStatus,daysUsed})).ss;
    assert.equal(p.level,level); assert.equal(p.certificateApplicable,false); assert.equal(p.policyOnly,true);
    assert.doesNotMatch(p.action,/file the certificate|move to local payroll/i);
  }
});
test('UK day 46 tax milestone does not raise employer PE',()=>{
  const e=evaluate(employee({daysUsed:46}));
  assert.equal(e.peRisk,'LOW'); assert.equal(e.taxResidencyRisk,'ELEVATED');
  assert.equal(e.pillars.pe.level,'WATCH');
  assert.match(e.pillars.pe.subRisks.taxResidency.action,/46 days/);
});
test('covered corridor still uses certificate schedule',()=>{
  const e=employee({homeCountry:'Canada',hostRegion:'India',daysUsed:15});
  assert.equal(evaluatePillars(e).ss.level,'WATCH');
  assert.equal(evaluatePillars({...e,certificateStatus:'Issued'}).ss.level,'OK');
});
test('Schengen unknown values and review actions',()=>{
  const e=evaluate(employee({hostRegion:'Schengen Area',daysUsed:74}));
  for(const p of Object.values(e.pillars)){assert.equal(p.limit,null);assert.equal(p.level,'WATCH');}
  for(const key of ['visaDaysLeft','taxDaysLeft','peDaysLeft','minDaysToCliff','annualOrbitalLocalCost'])assert.equal(e[key],null);
  for(const key of ['taxResidencyDays','peAlertBaseDays','localPayrollMonthlyUSD','entitySetupOneTimeUSD'])assert.equal(hostSummary('Schengen Area')[key],null);
  assert.equal(e.payrollReviewEligible,false);
  assert.ok(e.complianceActions.some(a=>a.risk==='jurisdiction'));
});
test('Mexico and Philippines do not invent residency day limits',()=>{
  for(const hostRegion of ['Mexico','Philippines']){
    const e=evaluate(employee({hostRegion,daysUsed:1}));
    assert.equal(e.taxDaysLeft,null);assert.equal(e.taxResidencyLevel,'WATCH');
  }
});
test('commercial feasibility is conditional, not automatic graduation',()=>{
  const e=evaluate(employee({certificateStatus:'Issued'}));
  assert.equal(e.payrollReviewEligible,true);assert.ok(e.annualSavingsVsEor>0);
  assert.match(e.recommendation,/feasibility/);
});
for(const homeCountry of HOMES) for(const hostRegion of HOSTS) test(homeCountry+' / '+hostRegion+' cross-track regression',()=>{
  for(const role of roles) for(const daysUsed of [0,1,30,46,60,90,120,183,184,365]) for(const currentSetup of ['Home Payroll','EOR ($599/mo)','Local Payroll']){
    const e=evaluate(employee({homeCountry,hostRegion,role,daysUsed,currentSetup}));
    const p=e.pillars, r=reportingEmployee(e);
    for(const k of PILLARS) assert.ok(levels.includes(p[k].level));
    assert.notEqual(e.taxResidencyLevel,'BREACH');
    assert.equal(levels.indexOf(p.pe.level),Math.max(levels.indexOf(e.peLevel),levels.indexOf(e.taxResidencyLevel)));
    assert.equal(r.employerPE.level,e.peLevel);assert.equal(r.individualTaxResidency.level,e.taxResidencyLevel);
    assert.deepEqual(r.complianceActions,e.complianceActions);
    if(e.complianceActions.length){assert.equal(e.payrollReviewEligible,false);assert.equal(e.annualSavingsVsEor,0);}
    for(const [risk,track] of [['visa',p.visa],['pe',p.pe.subRisks.pe],['taxResidency',p.pe.subRisks.taxResidency],['ss',p.ss]])if(!track.reviewRequired&&track.level!=='OK')assert.ok(e.complianceActions.some(a=>a.risk===risk));
    if(p.ss.covered===false){assert.equal(r.socialSecurity.form,null);assert.equal(r.socialSecurity.certificateStatus,null);}
  }
});
test('CSV escaping and formula injection mitigation',()=>{
  for(const [value,expected] of [['a"b','"a""b"'],['a,b','"a,b"'],['a\nb','"a\nb"'],[null,'""'],['=1','"\'=1"'],['  +1','"\'  +1"'],['@x','"\'@x"'],[-5,'"-5"']])assert.equal(csvCell(value),expected);
  const csv=buildComplianceCsv([evaluate(employee({name:'=SUM(1,2)'}))]);
  assert.ok(csv.includes('"\'=SUM(1,2)"'));
  assert.equal(csv.split('\r\n')[0].split(',').length,28);
});
