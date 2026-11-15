// Shared reporting projection: null means unknown/not modeled, never zero.
export function reportingEmployee(e) {
  const p = e.pillars;
  const track = t => ({ level: t.level, reviewRequired: !!t.reviewRequired, screeningLimitDays: t.limit ?? null, action: t.action, detail: t.detail });
  return {
    name: e.name, homeCountry: e.homeCountry, hostRegion: e.hostRegion, role: e.role, daysUsed: e.daysUsed,
    currentSetup: e.currentSetup, regionalPlaceholder: !!e.rule.regionalPlaceholder,
    visa: { ...track(p.visa), actualInitialGrantDays: p.visa.grantedDays ?? null, activeScreeningLimitDays: p.visa.limit ?? null, extensionStatus: e.visaExtensionStatus || 'Not approved', approvedTotalDays: p.visa.extensionApproved ? p.visa.limit : null, extensionApproved: !!p.visa.extensionApproved, rollingWindowDays: p.visa.rollingWindowDays ?? null },
    employerPE: track(p.pe.subRisks.pe), individualTaxResidency: track(p.pe.subRisks.taxResidency),
    combinedPillar2Status: p.pe.level,
    socialSecurity: { ...track(p.ss), agreementCovered: p.ss.covered ?? null, certificateApplicable: p.ss.covered === true ? true : p.ss.covered === false ? false : null, certificateStatus: p.ss.covered === true ? e.certificateStatus || 'Not filed' : null, form: p.ss.covered === true ? p.ss.rule : null, policyOnly: !!p.ss.policyOnly },
    daysToNearestScreeningAlert: e.minDaysToCliff ?? null,
    recommendation: e.recommendation, complianceActions: e.complianceActions,
    payrollReviewEligible: e.payrollReviewEligible, payrollReview: e.payrollReview,
    potentialAnnualEorSavingsUSD: e.payrollReviewEligible && e.currentSetup === 'EOR ($599/mo)' ? e.annualSavingsVsEor : null,
  };
}
export function csvCell(value) {
  if (value == null) return '""';
  let s = String(value);
  if (typeof value === 'string' && (/^[\s\uFEFF]*[=+\-@]/.test(s) || /^[\t\r\n]/.test(s))) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
export function buildComplianceCsv(employees) {
  const headers = ['Employee Name','Home Country','Host Region','Role','Days Used','Actual Initial Visa Grant (Days)','Active Visa Screening Limit (Days)','Extension Status','Approved Total Stay (Days)','Visa Status','Visa Review Required','Employer PE Status','PE Policy Limit (Days)','Individual Tax Residency Status','Tax Screening Reference (Days)','Combined Pillar 2 Status','Social Security Status','Agreement Covered','Treaty Certificate Applicable','Certificate Status','Certificate Form','Social Security Policy Only','Days to Nearest Screening Alert','Jurisdiction Review Required','Primary Recommendation','All Compliance Actions','Payroll Feasibility Review','Potential Annual EOR Savings (USD)'];
  const rows = employees.map(reportingEmployee).map(e => [e.name,e.homeCountry,e.hostRegion,e.role,e.daysUsed,e.visa.actualInitialGrantDays,e.visa.activeScreeningLimitDays,e.visa.extensionStatus,e.visa.approvedTotalDays,e.visa.level,e.visa.reviewRequired,e.employerPE.level,e.employerPE.screeningLimitDays,e.individualTaxResidency.level,e.individualTaxResidency.screeningLimitDays,e.combinedPillar2Status,e.socialSecurity.level,e.socialSecurity.agreementCovered,e.socialSecurity.certificateApplicable,e.socialSecurity.certificateStatus,e.socialSecurity.form,e.socialSecurity.policyOnly,e.daysToNearestScreeningAlert,e.regionalPlaceholder,e.recommendation,e.complianceActions.map(a=>a.risk+': '+a.level+' — '+a.text).join(' | '),e.payrollReview,e.potentialAnnualEorSavingsUSD]);
  return [headers,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
