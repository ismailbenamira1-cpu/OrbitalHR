// Deterministic, source-bound answer structure for the screening MVP.
// This is a completeness backstop, NOT an independent legal opinion.
const value = x => x == null || x === '' ? 'Not recorded / requires verification' : String(x);
const level = x => x === 'BREACH' ? 'ESCALATE (internal policy alert)' : value(x);
const detail = t => [`Screening status: ${level(t?.level)}.`,t?.reviewRequired ? 'Country or permission-specific review required.' : '',t?.detail || 'The screening data does not establish this obligation.', t?.action ? `Suggested review: ${t.action}` : 'Confirm actual legal position with an adviser.'].filter(Boolean).join(' ');
const payroll = e => {
  if(e.regionalPlaceholder) return 'HOLD: Specify the actual host country before assessing local payroll or an entity.';
  if(!e.payrollReviewEligible) return 'HOLD: No payroll transition is recommended by this screening. Resolve immigration, employer PE, tax and social-security questions independently before considering a change.';
  const estimate=e.potentialAnnualEorSavingsUSD != null ? ` Indicative annual EOR fee comparison: USD ${e.potentialAnnualEorSavingsUSD}; not guaranteed and excludes legal, entity, employer tax and setup costs.` : '';
  return `OPTIONAL FEASIBILITY REVIEW: ${value(e.payrollReview)}. This is not approval to switch payroll.${estimate}`;
};
const actionLines = e => Array.isArray(e.complianceActions) && e.complianceActions.length
  ? e.complianceActions.map((a,i)=>`${i+1}. [${level(a.level)}] ${value(a.risk)}: ${value(a.text)}`).join('\n')
  : '1. Confirm actual visa/work permission, treaty eligibility, residence and employer PE facts before relying on low-risk screening flags.\n2. Set review dates and re-evaluate after travel, role, or payroll changes.';
export function screeningBrief(employee) {
  const e=employee;
  return [
    'EMPLOYEE SCREENING BRIEF',
    `Employee: ${value(e.name)} | Route: ${value(e.homeCountry)} to ${value(e.hostRegion)} | Recorded days: ${value(e.daysUsed)} | Role: ${value(e.role)} | Current payroll: ${value(e.currentSetup)}`,
    '',
    '1. IMMIGRATION & WORK PERMISSION',
    detail(e.visa),
    `Recorded initial permission: ${value(e.visa?.actualInitialGrantDays)} days. Extension status: ${value(e.visa?.extensionStatus)}. Approval-based total: ${value(e.visa?.approvedTotalDays)} days. Verify entry/expiry dates, nationality, exact route and permitted activities; the screening limit alone is NOT permission to work.`,
    '',
    '2. EMPLOYER PERMANENT ESTABLISHMENT (PE)',
    detail(e.employerPE),
    'Verify duties, authority to conclude contracts, fixed-place/home-office arrangements, employer facts and the relevant treaty; a day-count policy score cannot establish or exclude PE.',
    '',
    '3. INDIVIDUAL TAX RESIDENCY',
    detail(e.individualTaxResidency),
    'Confirm the applicable tax year, previous visits, home and family ties, local income and treaty tie-breakers. Screening alerts are not residence determinations.',
    '',
    '4. SOCIAL SECURITY',
    detail(e.socialSecurity),
    `Agreement coverage in model: ${value(e.socialSecurity?.agreementCovered)}. Certificate applicable: ${value(e.socialSecurity?.certificateApplicable)}. Certificate status: ${value(e.socialSecurity?.certificateStatus)}. Form/reference: ${value(e.socialSecurity?.form)}. Verify coverage, detachment conditions, registration deadlines and host contributions; never assume a certificate is available when the model marks it inapplicable.`,
    '',
    '5. PRIORITIZED NEXT STEPS',
    actionLines(e),
    '',
    '6. PAYROLL & EOR FEASIBILITY',
    payroll(e),
    '',
    '7. INFORMATION STILL NEEDED',
    'Confirm travel dates and prior stays, destination jurisdiction where regional, immigration status and permitted work, actual employer role and contracting powers, tax-year residence/ties, social-security registration/certificate documents, and local payroll/entity costs.',
    '',
    'SCREENING ONLY: These are internal risk-management indicators, not legal findings or authorization. Confirm next actions with qualified local immigration, tax, employment and social-security advisers.'
  ].join('\n');
}
export function screeningRosterOverview(roster) {
  if(!roster.length) return 'There are no saved employees to assess. Sign in and save a fictional or real roster entry only when you are authorised to do so.';
  return [
    `DIRECT ANSWER: ${roster.length} saved employee(s). Every employee needs at least baseline verification of work permission, employer PE, personal tax residence and social-security coverage. A risk alert indicates priority for review, not an established legal violation.`,
    ...roster.map((e,i)=>[
      '',
      `${i+1}. ${value(e.name)} — ${value(e.homeCountry)} to ${value(e.hostRegion)} (${value(e.daysUsed)} recorded days)`,
      `Immigration: ${detail(e.visa)}`,
      `Employer PE: ${detail(e.employerPE)}`,
      `Individual tax residency: ${detail(e.individualTaxResidency)}`,
      `Social security: ${detail(e.socialSecurity)} Certificate: ${value(e.socialSecurity?.certificateStatus)}.`,
      `Next action: ${value(e.complianceActions?.[0]?.text || e.recommendation || 'Confirm jurisdiction-specific legal facts with an adviser.')}`,
      `Payroll: ${payroll(e)}`
    ].join('\n')),
    '',
    'MISSING INFORMATION & NEXT STEPS: Confirm actual entry/exit dates, permits and work activities, precise destination(s), corporate decision-making powers, tax-year history and ties, treaty/certificate status, payroll/registration obligations and employer-side cost assumptions. Prioritize ESCALATE/CRITICAL review first, then WATCH.',
    '',
    'SCREENING ONLY: Do not treat these flags as legal clearance or a finding of statutory breach. Use qualified advisers for consequential decisions.'
  ].join('\n');
}
export function isFullRosterQuestion(query) {
  return /all (?:my |the )?employees|each employee|entire roster|saved roster|across (?:all |different )?(?:pillars|areas)|compliance review|comprehensive|full (?:review|analysis)|which employees.*review/i.test(query || '');
}
export function hasRequiredBriefSections(answer) {
  const s=String(answer||'');
  // The output must contain all seven actual sections, not just mention these topics in passing.
  return [
    /^\\s*1[.)]\\s*IMMIGRATION/im,
    /^\\s*2[.)]\\s*EMPLOYER.*(?:PERMANENT ESTABLISHMENT|PE)/im,
    /^\\s*3[.)]\\s*INDIVIDUAL TAX/im,
    /^\\s*4[.)]\\s*SOCIAL SECURITY/im,
    /^\\s*5[.)]\\s*PRIORITI[ZS]ED NEXT STEPS/im,
    /^\\s*6[.)]\\s*PAYROLL/im,
    /^\\s*7[.)]\\s*INFORMATION STILL NEEDED/im
  ].every(re=>re.test(s)) && s.trim().length >= 1500;
}
