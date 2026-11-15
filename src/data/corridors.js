// Orbital HR rules engine: 2 home countries x 7 host regions x 3 pillars = 42 matrix cells.
// Historical source-review labels only; independent legal verification and professional sign-off are still pending.
// "conf" is not a representation that any corridor is legally approved or current.
// Day thresholds marked "policy" are Orbital alert settings, not legal limits.
export const HOMES = ['United States', 'Canada'];
export const HOSTS = ['Schengen Area', 'United Kingdom', 'Mexico', 'India', 'Philippines', 'Thailand', 'Indonesia'];
export const LAST_VERIFIED = 'Source review pending';
export const LEVELS = ['OK', 'WATCH', 'CRITICAL', 'BREACH'];
export const PILLARS = ['ss', 'pe', 'visa'];
export const PILLAR_TITLES = { ss: 'Pillar 1: Social Security', pe: 'Pillar 2: PE & Tax', visa: 'Pillar 6: Visa & Stay' };

export const SCHENGEN_NOTICE = 'Schengen is a regional placeholder, not a single legal jurisdiction. Identify each destination country before assessing tax, PE, social security or work permission.';
export const SCHENGEN_REVIEW = {
  Germany: 'Review available dwelling or habitual abode.',
  France: 'Review home, principal stay, professional activity and economic interests.',
  Spain: 'Review day count, economic interests and family ties.',
};
const HOST = {
  'Schengen Area': {
    visa: { limit: 90, conf: 'verified', short: '90 days in any rolling 180 (EES biometric tracking; ETIAS expected late 2026, confirm start date)', pathway: 'Visa-free short stay, or a national remote-work / digital nomad visa where offered', milestones: [] },
    tax: { T: null, alertT: null, conf: 'verify', peConf: 'verify', short: 'Germany, France and Spain are suggested first states to model: none is a pure 183-day test. Germany can trigger on an available dwelling or habitual abode; France on home/principal stay, principal professional activity or economic interests; Spain on 183+ days, economic interests, or family ties.', prompt: 'Ask about an available home, family location and centre of income/economic interests; model country-specific triggers rather than relying on 183 days alone.', src: 'Secondary review; statutes not directly read' },
    peBase: null, payroll: null, entity: null,
  },
  'United Kingdom': {
    visa: { limit: 180, conf: 'verified', short: 'Up to 6 months per visit; ETA required; work for a foreign employer must stay incidental', pathway: 'Standard Visitor (incidental remote work) or Global Business Mobility routes', milestones: [] },
    tax: { T: 183, alertT: 183, conf: 'verified', peConf: 'secondary', short: 'Statutory Residence Test: 183+ days is automatic residency; for new arrivers 46+ days with 4 ties, 91+ with 3 ties, 121+ with 2 ties can also create residency', milestones: [{ day: 46, lead: 0, label: 'UK SRT: ties test can make this person resident from 46 days' }] },
    peBase: 'High', payroll: 130, entity: 2800,
  },
  Mexico: {
    visa: { limit: 180, initialLimit: 180, extendedLimit: 180, extensionRequiredAt: null, extensionDiscretionary: true, entryAssigned: true, conf: 'verified', short: '180 days is the legal ceiling, not a safe planning limit: the immigration officer sets the days at entry (often fewer). Track the days printed on the FMM or digital FMM; no paid work in Mexico.', pathway: 'Visitor (FMM) or Temporary Resident visa (Residente Temporal) for longer stays', milestones: [] },
    tax: { T: null, alertT: 183, conf: 'secondary', peConf: 'secondary', short: 'Mexico has no domestic day-count test for individuals. Residence depends on a Mexican home and, if another home exists, the centre of vital interests (including Mexican-source income or main professional activities). Treat 183 days only as a treaty marker.', prompt: 'Flag from day one if the person owns or rents a Mexican home, relocates family, earns over 50% of income from Mexican sources, or has a Mexican professional base.', src: 'CFF art. 9 reproduced sources; secondary corroboration', milestones: [] },
    peBase: 'High', payroll: 110, entity: 3200,
  },
  India: {
    visa: { limit: 180, conf: 'verified', short: '180 days continuous per visit for US and Canadian citizens on the relevant e-Visa routes; FRRO registration is required beyond 180 days. 1-year/5-year e-Tourist visas are also capped at 180 days per calendar year. e-Visa is not valid for employment, and remote work is not expressly permitted.', pathway: 'e-Business visa for visits; Employment visa for local hires (no digital nomad visa)', milestones: [] },
    tax: { T: 182, alertT: 90, conf: 'verified', peConf: 'secondary', short: 'Resident if 182+ days in the Indian tax year, or 60+ days plus 365+ days in the preceding four years; special 120-day and deemed-residency rules can apply to certain Indian citizens/PIOs. Treaty service-PE risk is reported above 90 days in any 12 months for US and Canada cases.', src: 'Income-tax Act 2025 / Income Tax Department FAQ; treaty PE threshold from secondary sources', milestones: [] },
    peBase: 'High', payroll: 95, entity: 3800,
  },
  Philippines: {
    visa: { limit: 59, initialLimit: 30, extendedLimit: 59, extensionRequiredAt: 30, extensionDiscretionary: true, conf: 'secondary', short: '30 days visa-free on arrival; initial Bureau of Immigration waiver may bring total to 59 days. Additional extensions may be possible and require a separately verified route; visitor permission does not itself authorise work. Apply before the current permission expires.', pathway: '9A tourist extension or 9G pre-arranged employment visa', milestones: [{ day: 30, lead: 7, label: 'File Bureau of Immigration extension before day 30' }] },
    tax: { T: null, alertT: 90, conf: 'secondary', peConf: 'secondary', short: 'Compensation for services performed in the Philippines is Philippine-source and can be taxable from day one. 180 days changes the domestic tax treatment; treaty relief is narrower and the US threshold needs professional confirmation (90 vs 183 days reported by sources).', src: 'NIRC/BIR guidance via professional summaries; treaty threshold secondary', milestones: [] },
    peBase: 'Moderate', payroll: 90, entity: 3500,
  },
  Thailand: {
    visa: { limit: 60, initialLimit: 30, extendedLimit: 60, extensionRequiredAt: 30, extensionDiscretionary: true, conf: 'verified', short: 'US and Canadian citizens have 30 days visa-free from 15 Sep 2026 for tourism only, with 20,000 THB funds per person (40,000 per family). An extension of up to 30 days is solely at the immigration officer’s discretion.', pathway: 'Destination Thailand Visa (DTV, up to 180 days per entry) or Non-Immigrant B with work permit', milestones: [{ day: 30, lead: 7, label: 'Extend stay before day 30 or exit' }] },
    tax: { T: 180, alertT: 180, conf: 'secondary', peConf: 'secondary', short: '180+ days makes a person Thai tax resident. Foreign income earned on or after 1 Jan 2024 while resident is taxable when remitted in any year; income earned before 2024 or in a non-resident year is not taxed on remittance. Proposed remittance relief remains draft.', src: 'Revenue Department orders via law-firm trackers', milestones: [] },
    peBase: 'Moderate', payroll: 100, entity: 3600,
  },
  Indonesia: {
    visa: { limit: 60, initialLimit: 30, extendedLimit: 60, extensionRequiredAt: 30, extensionDiscretionary: true, conf: 'secondary', short: 'Visa on arrival: 30 days, extendable once by 30 days (60 total); tourist status does not allow work', pathway: 'E33G remote worker KITAS or PT PMA with work KITAS', milestones: [{ day: 30, lead: 7, label: 'Extend visa on arrival before day 30' }] },
    tax: { T: 184, alertT: 120, conf: 'verified', peConf: 'secondary', short: 'Resident if present more than 183 days in any 12 months, or present during the tax year with intent to reside; intent can be evidenced by a qualifying permit, visa, contract, lease or family relocation. Treaty service-PE and employment tests use 120 days in the reviewed US/Canada materials.', src: 'DGT residency guidance; treaty threshold secondary', milestones: [] },
    peBase: 'High', payroll: 95, entity: 4200,
  },
};

const HOME_TAX = {
  'United States': 'US citizens and residents stay taxed on worldwide income: use the foreign tax credit (Form 1116) or the foreign earned income exclusion (Form 2555, 330-day physical presence test).',
  Canada: 'Canada taxes residents on worldwide income and decides residency by residential ties, not days alone: use foreign tax credits and check the tax treaty.',
};

const NONE = (host) => ({ covered: false, form: 'No agreement in force', months: 0, conf: 'verified', note: `No social security agreement with ${host}: dual contributions are possible if host coverage applies.` });
const SS = {
  'United States': {
    'Schengen Area': { covered: true, form: 'SSA Certificate of Coverage (online request)', months: 60, conf: 'secondary', note: 'US agreements cover many Schengen states, generally with detached-worker rules up to 5 years. The reviewed non-agreement states are Bulgaria, Croatia, Estonia, Latvia, Liechtenstein, Lithuania and Malta; Romania entered into force 1 Sep 2026. Confirm the specific country and current SSA list.' },
    'United Kingdom': { covered: true, form: 'SSA Certificate of Coverage (online request)', months: 60, conf: 'secondary', note: 'US-UK agreement covers temporary assignments of up to 5 years.' },
    Mexico: NONE('Mexico'), India: NONE('India'), Philippines: NONE('the Philippines'), Thailand: NONE('Thailand'), Indonesia: NONE('Indonesia'),
  },
  Canada: {
    'Schengen Area': { covered: true, form: 'CRA CPT form by country (e.g. CPT130 Germany, CPT52 France, CPT125 Spain)', months: 24, conf: 'verified', note: 'CRA lists agreements with most Schengen states. Initial detachment is 24 to 60 months depending on the country (e.g. Germany 60, France 36, Belgium 24).' },
    'United Kingdom': { covered: true, form: 'CRA Form CPT71', months: 60, conf: 'verified', note: 'Canada-UK agreement: certificate of coverage, up to 60 months initial detachment.' },
    Mexico: { covered: true, form: 'CRA Form CPT62', months: 60, conf: 'verified', note: 'Canada-Mexico agreement: up to 60 months initial detachment.' },
    India: { covered: true, form: 'CRA Form CPT169', months: 60, conf: 'verified', note: 'Canada-India agreement (in force Aug 2015): up to 60 months initial detachment.' },
    Philippines: { covered: true, form: 'CRA Form CPT64', months: 60, conf: 'verified', note: 'Canada-Philippines agreement: up to 60 months initial detachment.' },
    Thailand: NONE('Thailand'), Indonesia: NONE('Indonesia'),
  },
};

// Orbital PE risk-policy modifiers. These are deliberately conservative operational adjustments, not treaty or statutory thresholds.
const ROLE_FACTOR = { 'Sales / Revenue': 0.75, Executive: 0.75, 'Manager / Team Lead': 0.9 };
const PE_HIGH_RISK_FACTOR = 0.9; // policy adjustment for hosts with elevated PE exposure
const SS_CERT = { 'Not filed': [15, 30, 60], Filed: [30, 60, 90] }; // policy: [watch, critical, breach] days
// Policy schedule for corridors without a bilateral social-security agreement. These are Orbital operational alerts, not legal contribution thresholds.
const SS_NO_AGREEMENT = [1, 30, 60]; // [watch, critical, breach] days

// Policy boundaries: WATCH at ~67% of the limit, CRITICAL 5+ days (about 17%) before it. Example: 90-day limit -> watch 60, critical 75.
export const bounds = (limit) => ({ limit, watchAt: Math.round(limit * 0.67), criticalAt: limit - Math.max(5, Math.round(limit * 0.17)) });
const rank = (l) => LEVELS.indexOf(l);

export function levelFor(days, b, milestones = []) {
  let lv = days >= b.limit ? 'BREACH' : days >= b.criticalAt ? 'CRITICAL' : days >= b.watchAt ? 'WATCH' : 'OK';
  milestones.forEach((m) => {
    if (days >= m.day - (m.lead ?? 7) && days < b.limit && rank(lv) < rank('WATCH')) lv = 'WATCH';
  });
  return lv;
}

export function pillarCell(home, host, pillar, { role = 'Individual Contributor', cert = 'Not filed', visaAuthorizedDays = null, visaExtensionStatus = 'Not approved', visaExtendedDays = null } = {}) {
  const h = HOST[host];
  const base = { pillar, home, host, title: PILLAR_TITLES[pillar], lastVerified: LAST_VERIFIED, milestones: [] };
  if (host === 'Schengen Area' && pillar !== 'visa') {
    const detail = SCHENGEN_NOTICE + ' No regional legal threshold or certificate coverage can be established. Country-specific review is required from day one.';
    const review = { limit: null, watchAt: null, criticalAt: null, rule: 'Country-specific review required', detail, conf: 'verify', milestones: [], reviewRequired: true, lastVerified: LAST_VERIFIED };
    if (pillar === 'pe') return { ...base, ...review, pePolicy: { ...review }, taxResidency: { ...review } };
    return { ...base, ...review, covered: null };
  }
  if (pillar === 'visa' && host === 'Schengen Area') return { ...base, limit: null, watchAt: null, criticalAt: null, rule: h.visa.short, detail: '90 days in any rolling 180 is a short-stay rule, not work permission. Aggregate days abroad cannot establish the remaining allowance. Review dated travel history and national work permission.', conf: 'verify', reviewRequired: true, rollingWindowDays: 180, shortStayAllowanceDays: 90 };
  if (pillar === 'visa') {
    const initialLimit = h.visa.initialLimit ?? h.visa.limit;
    const extendedLimit = h.visa.extendedLimit ?? h.visa.limit;
    const extensionRequiredAt = h.visa.extensionRequiredAt ?? null;
    const entryAssigned = h.visa.entryAssigned ?? false;
    const positiveDays = (v) => Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : null;
    const granted = positiveDays(visaAuthorizedDays);
    const approvedTotal = positiveDays(visaExtendedDays);
    const extensionApproved = visaExtensionStatus === 'Approved' && approvedTotal !== null && approvedTotal > (granted ?? initialLimit) && approvedTotal <= extendedLimit && !entryAssigned;
    const reviewRequired = entryAssigned && (granted === null || granted > initialLimit);
    const limit = reviewRequired ? null : extensionApproved ? approvedTotal : Math.min(granted ?? initialLimit, initialLimit);
    const milestones = [...(h.visa.milestones || [])];
    if (extensionRequiredAt && !milestones.some((m) => m.day === extensionRequiredAt)) {
      milestones.push({ day: extensionRequiredAt, lead: 7, label: h.visa.extensionDiscretionary ? 'Extension decision is discretionary: apply before this date or plan departure' : 'Extension required before this date' });
    }
    const detail = [h.visa.pathway, host === 'Schengen Area' ? '90/180 is a regional short-stay rule, not permission to work. Check national work rules and rolling travel history.' : null, entryAssigned ? 'Entry grant must be recorded; 180 days is only the ceiling.' : `Initial route ceiling: ${initialLimit} days.`, extendedLimit > initialLimit ? `Modeled first-extension screening total: ${extendedLimit} days${h.visa.extensionDiscretionary ? ' only if the extension is granted' : ''}. Other permissions or further extensions require separate review.` : null, entryAssigned ? 'Use the stay actually granted at entry; the legal ceiling is not a guaranteed entitlement.' : host === 'United Kingdom' ? '180 days is only an approximate screening assumption for a six-calendar-month visitor route; verify calendar dates, individual permission and authorised activity.' : null].filter(Boolean).join(' ');
    return { ...base, ...(limit === null ? {limit:null,watchAt:null,criticalAt:null} : bounds(limit)), rule: h.visa.short, detail, conf: h.visa.conf, milestones: extensionApproved ? [] : milestones, initialLimit: entryAssigned ? null : initialLimit, extendedLimit, extensionRequiredAt, extensionDiscretionary: h.visa.extensionDiscretionary ?? false, entryAssigned, reviewRequired, extensionApproved, visaExtensionStatus, grantedDays: granted };
  }
  if (pillar === 'pe') {
    const alertT = h.tax.alertT ?? h.tax.T;
    const legalReferenceDays = h.tax.T;
    const roleFactor = ROLE_FACTOR[role] ?? 1;
    const highRiskFactor = h.peBase === 'High' ? PE_HIGH_RISK_FACTOR : 1;
    const limit = Math.min(alertT, Math.max(15, Math.round(alertT * highRiskFactor * roleFactor)));
    const detailParts = [`Orbital PE policy threshold: ${limit} days. Internal PE screening base: ${alertT} days (not a verified legal threshold). Base PE risk: ${h.peBase}. Role "${role}" applies a ${Math.round((1 - roleFactor) * 100)}% policy reduction${h.peBase === 'High' ? '; elevated host risk applies an additional 10% policy reduction' : ''}.`];
    if (h.tax.prompt) detailParts.push(`Review prompt: ${h.tax.prompt}`);
    if (h.tax.src) detailParts.push(`Sources: ${h.tax.src}`);
    detailParts.push(HOME_TAX[home]);
    // Tax-residency milestones belong to the residency track, not the PE policy limit.
    const taxResidency = { ...(legalReferenceDays === null ? { limit: null, watchAt: null, criticalAt: null } : bounds(legalReferenceDays)), referenceDays: legalReferenceDays, screeningOnly: true, rule: h.tax.short, detail: `Tax-residency screening: ${h.tax.short} Aggregate days are not a legal residency determination; verify the relevant tax period, history and other criteria.`, conf: h.tax.conf, milestones: h.tax.milestones || [] };
    const pePolicy = { ...bounds(limit), rule: `PE policy threshold: ${limit} days`, detail: detailParts.join(' '), conf: h.tax.peConf || h.tax.conf, milestones: [] };
    return { ...base, ...pePolicy, taxResidency, pePolicy, rule: pePolicy.rule, detail: detailParts.join(' '), conf: h.tax.peConf || h.tax.conf, milestones: [] };
  }
  const s = SS[home][host];
  if (s.covered) {
    const months = s.months;
    if (cert === 'Issued') return { ...base, ...bounds(months * 30), rule: s.form, detail: `Certificate issued. Up to ${months} months initial detachment. ${s.note}`, conf: s.conf, covered: true };
    const [w, c, l] = SS_CERT[cert] || SS_CERT['Not filed'];
    return { ...base, limit: l, watchAt: w, criticalAt: c, rule: s.form, detail: `Certificate ${cert.toLowerCase()}. ${s.note}`, conf: s.conf, covered: true };
  }
  const [w, c, l] = SS_NO_AGREEMENT;
  return { ...base, limit: l, watchAt: w, criticalAt: c, rule: s.form, detail: `${s.note} Review before work starts; obligations may arise from the first day of work. Orbital policy alerts apply at ${w}/${c}/${l} days (WATCH/CRITICAL/BREACH); these are internal escalation deadlines, not legal contribution thresholds or grace periods. Treaty certificate relief is unavailable.`, conf: s.conf, covered: false, policyOnly: true, certificateApplicable: false, milestones: [{ day: w, lead: 0, label: 'No treaty relief: confirm whether host social security applies' }] };
}

const SS_NO_AGREEMENT_ACTIONS = {
  OK: 'Pre-assignment: confirm home and host social-security obligations before work begins.',
  WATCH: 'Confirm home and host coverage, registration and contribution obligations now; dual contributions may apply from day one.',
  CRITICAL: 'Escalate unresolved coverage to HR and a local social-security adviser; confirm registration, contributions and any arrears immediately.',
  BREACH: 'Internal escalation deadline reached, not a finding of statutory breach. Escalate immediately and remediate any confirmed registration or contribution obligations.',
};
const ACTIONS = {
  visa: { OK: 'No configured stay-day alert; separately verify actual entry permission, work rights and travel history.', WATCH: 'Plan an extension or a visa pathway now.', CRITICAL: 'Alert HR: apply for an extension or arrange departure or a work visa.', BREACH: 'Internal authorised-stay warning: urgently verify individual permission, expiry and legally available options with an immigration adviser.' },
  pe: { OK: 'No internal PE day-count alert; review facts and applicable tax treaty with counsel.', WATCH: 'Review role, contract signing and home-office use in the host country.', CRITICAL: 'Escalate employer PE review to HR and corporate tax counsel; assess contracting authority and business presence.', BREACH: 'Internal PE escalation threshold reached; assess employer PE with corporate tax counsel.' },
  ss: { OK: 'No current certificate-screening alert; confirm actual coverage and validity with the competent authority.', WATCH: 'Request the certificate of coverage now (or confirm host contribution rules).', CRITICAL: 'Alert HR: certificate overdue or host contributions likely; act this week.', BREACH: 'Internal screening threshold reached; urgently verify actual contribution and certificate obligations with an adviser.' },
};

export function evaluatePillars(emp) {
  const home = emp.homeCountry === 'Canada' ? 'Canada' : 'United States';
  const host = HOST[emp.hostRegion] ? emp.hostRegion : HOSTS[0];
  const days = Number(emp.daysUsed) || 0;
  const out = {};
  PILLARS.forEach((p) => {
    const c = pillarCell(home, host, p, { role: emp.role, cert: emp.certificateStatus || 'Not filed', visaAuthorizedDays: emp.visaAuthorizedDays, visaExtensionStatus: emp.visaExtensionStatus, visaExtendedDays: emp.visaExtendedDays });

    if (p === 'ss' && c.covered === false) {
      const level = levelFor(days, c, c.milestones);
      out[p] = { ...c, level, days, action: SS_NO_AGREEMENT_ACTIONS[level] };
      return;
    }
    if (p === 'visa' && c.reviewRequired) { out[p] = { ...c, level: 'WATCH', days, action: host === 'Schengen Area' ? 'Review dated travel history for the rolling 90/180 allowance and national work permission.' : 'Record the actual authorised stay granted at entry before relying on a countdown.' }; return; }
    if (c.reviewRequired) {
      const review = { ...c, level: 'WATCH', days, action: SCHENGEN_NOTICE };
      out[p] = p === 'pe' ? { ...review, subRisks: { pe: { ...c.pePolicy, level: 'WATCH', days, action: SCHENGEN_NOTICE }, taxResidency: { ...c.taxResidency, level: 'WATCH', days, action: SCHENGEN_NOTICE } } } : review;
      return;
    }
    if (p === 'pe' && c.pePolicy && c.taxResidency) {
      const peLevel = levelFor(days, c.pePolicy, c.pePolicy.milestones);
      const rawTaxLevel = c.taxResidency.limit === null ? (days > 0 ? 'WATCH' : 'OK') : levelFor(days, c.taxResidency, c.taxResidency.milestones);
      // Residency is not a violation. A reference reached is an urgent review, never BREACH.
      const taxLevel = rawTaxLevel === 'BREACH' ? 'CRITICAL' : rawTaxLevel;
      const level = rank(taxLevel) > rank(peLevel) ? taxLevel : peLevel;
      const taxMs = c.taxResidency.milestones.find((m) => days >= m.day - (m.lead ?? 7) && days < c.taxResidency.limit);
      const actionBase = level === taxLevel && taxLevel !== 'OK'
        ? 'Review individual tax-residency exposure with tax counsel.'
        : ACTIONS.pe[level];
      out[p] = {
        ...c,
        level,
        days,
        action: taxMs && taxLevel === 'WATCH' ? `${taxMs.label}. ${actionBase}` : actionBase,
        subRisks: {
          pe: { ...c.pePolicy, level: peLevel, days, action: ACTIONS.pe[peLevel] },
          taxResidency: { ...c.taxResidency, level: taxLevel, days, action: taxMs && taxLevel === 'WATCH' ? `${taxMs.label}. Review individual tax-residency exposure with tax counsel.` : 'Review individual tax-residency exposure with tax counsel.' },
        },
      };
      return;
    }

    const level = levelFor(days, c, c.milestones);
    const ms = c.milestones.find((m) => days >= m.day - (m.lead ?? 7) && days < c.limit);
    out[p] = { ...c, level, days, action: p === 'visa' && level === 'BREACH' ? 'Authorised-stay alert boundary reached: verify expiry immediately; depart or regularise before permission expires.' : p === 'visa' && level === 'OK' ? 'Below recorded or route screening limit; verify actual permission and work rights.' : ms && level === 'WATCH' ? `${ms.label}. ${ACTIONS[p][level]}` : ACTIONS[p][level] };
  });
  return out;
}

export function hostSummary(host) {
  const h = HOST[host] || HOST[HOSTS[0]];
  return { regionalPlaceholder: host === 'Schengen Area', jurisdictionNotice: host === 'Schengen Area' ? SCHENGEN_NOTICE : null, countryReview: host === 'Schengen Area' ? SCHENGEN_REVIEW : null, visaLimitDays: host === 'Schengen Area' ? null : h.visa.limit, taxResidencyMilestones: h.tax.milestones || [], visaInitialLimitDays: host === 'Schengen Area' ? null : h.visa.initialLimit ?? h.visa.limit, visaExtendedLimitDays: host === 'Schengen Area' ? null : h.visa.extendedLimit ?? h.visa.limit, visaExtensionRequiredAtDays: h.visa.extensionRequiredAt ?? null, visaExtensionDiscretionary: h.visa.extensionDiscretionary ?? false, visaEntryAssigned: h.visa.entryAssigned ?? false, visaRuleShort: h.visa.short, visaPathway: h.visa.pathway, taxResidencyDays: h.tax.T, peAlertBaseDays: h.tax.alertT ?? h.tax.T, taxRuleShort: h.tax.short, taxPrompt: h.tax.prompt, sources: h.tax.src, peBaseRisk: h.peBase, localPayrollMonthlyUSD: h.payroll, entitySetupOneTimeUSD: h.entity, lastVerified: LAST_VERIFIED };
}

export const worstLevel = (ps) => PILLARS.map((p) => ps[p].level).reduce((a, b) => (rank(b) > rank(a) ? b : a), 'OK');
export const buildMatrix = () => HOMES.flatMap((hm) => HOSTS.flatMap((ht) => PILLARS.map((p) => pillarCell(hm, ht, p))));
