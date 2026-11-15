import { evaluatePillars, hostSummary, worstLevel } from './corridors.js';

export function evaluateEmployee(emp, allEmployees, eorMonthlyFee, orbitalMonthlyFee) {
  const pillars = evaluatePillars(emp);
  const rule = { ...hostSummary(emp.hostRegion), visaLimitDays: pillars.visa.limit };
  const regionalHeadcount = allEmployees.filter((e) => e.hostRegion === emp.hostRegion).length;

  const visaDaysLeft = pillars.visa.limit === null ? null : pillars.visa.limit - emp.daysUsed;
  const taxDaysLeft = pillars.pe.subRisks.taxResidency.limit == null ? null : pillars.pe.subRisks.taxResidency.limit - emp.daysUsed;
  const peDaysLeft = pillars.pe.reviewRequired ? null : (pillars.pe.subRisks?.pe?.limit ?? pillars.pe.limit) - emp.daysUsed;
  const peAlertBaseDays = rule.peAlertBaseDays;
  const countdowns = [pillars.visa, pillars.ss, pillars.pe.subRisks.pe, pillars.pe.subRisks.taxResidency].filter(p => !p.reviewRequired && Number.isFinite(p.limit)).map(p => p.limit - emp.daysUsed);
  const minDaysToCliff = countdowns.length ? Math.min(...countdowns) : null;
  const worst = worstLevel(pillars);
  const isCliffAlert = worst === 'CRITICAL' || worst === 'BREACH';
  const peLevel = pillars.pe.subRisks.pe.level;
  const taxResidencyLevel = pillars.pe.subRisks.taxResidency.level;
  const riskLabel = { OK: 'LOW', WATCH: 'ELEVATED', CRITICAL: 'CRITICAL', BREACH: 'CRITICAL' };
  const peRisk = riskLabel[peLevel];
  const taxResidencyRisk = riskLabel[taxResidencyLevel];
  const ssInfo = { form: pillars.ss.rule, note: pillars.ss.detail };

  // Compliance interventions are independent of commercial payroll planning.
  const complianceActions = [];
  const addAction = (risk, level, text) => complianceActions.push({ risk, level, text });
  const visa = pillars.visa;
  const pe = pillars.pe.subRisks.pe;
  const tax = pillars.pe.subRisks.taxResidency;
  const ss = pillars.ss;
  if (rule.regionalPlaceholder) addAction('jurisdiction', 'WATCH', 'Identify actual destination country and verify national work, tax and social-security rules');
  if (visa.reviewRequired || visa.level !== 'OK') addAction('visa', visa.level, visa.reviewRequired ? (rule.regionalPlaceholder ? 'Review rolling Schengen travel history and national work permission' : 'Record actual authorised stay') : visa.level === 'BREACH' ? 'Urgently verify immigration expiry and regularise status or depart' : 'Review immigration permission and extension or departure options');
  if (!pe.reviewRequired && pe.level !== 'OK') addAction('pe', pe.level, 'Review employer PE exposure with corporate tax counsel');
  if (!tax.reviewRequired && tax.level !== 'OK') addAction('taxResidency', tax.level, 'Review individual tax residency and filing obligations');
  if (!ss.reviewRequired && ss.level !== 'OK') addAction('ss', ss.level, ss.action);
  const severity = { OK: 0, WATCH: 1, CRITICAL: 2, BREACH: 3 };
  complianceActions.sort((a, b) => severity[b.level] - severity[a.level]);
  // A headcount or cost signal is only a feasibility review, never authorisation to change payroll.
  const payrollReviewEligible = !rule.regionalPlaceholder && !complianceActions.length &&
    (emp.currentSetup === 'EOR ($599/mo)' || (regionalHeadcount >= 5 && emp.currentSetup !== 'Local Payroll'));
  const payrollReview = payrollReviewEligible ? (regionalHeadcount >= 5 ? 'Assess local entity feasibility' : 'Assess local payroll feasibility') : null;
  const recommendation = complianceActions[0]?.text || payrollReview || 'Maintain current setup; verify ongoing compliance';
  const annualEorCost = eorMonthlyFee * 12;
  const annualOrbitalLocalCost = rule.localPayrollMonthlyUSD == null ? null : (orbitalMonthlyFee + rule.localPayrollMonthlyUSD) * 12;
  const annualSavingsVsEor = payrollReviewEligible && emp.currentSetup === 'EOR ($599/mo)'
    ? Math.max(0, annualEorCost - annualOrbitalLocalCost)
    : 0;

  return {
    ...emp,
    rule,
    pillars,
    regionalHeadcount,
    visaDaysLeft,
    taxDaysLeft,
    peDaysLeft,
    peAlertBaseDays,
    minDaysToCliff,
    isCliffAlert,
    peRisk,
    peLevel,
    taxResidencyRisk,
    taxResidencyLevel,
    ssInfo,
    recommendation,
    complianceActions,
    payrollReviewEligible,
    payrollReview,
    annualEorCost,
    annualOrbitalLocalCost,
    annualSavingsVsEor,
  };
}

