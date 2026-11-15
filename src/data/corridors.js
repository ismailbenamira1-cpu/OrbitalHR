// Orbital HR rules engine: 2 home countries x 7 host regions x 3 pillars = 42 matrix cells.
// "conf": verified = official source checked Nov 2026; secondary = consistent across secondary sources;
//         verify = confirm with local counsel before relying on it.
// Day thresholds marked "policy" are Orbital alert settings, not legal limits.
export const HOMES = ['United States', 'Canada'];
export const HOSTS = ['Schengen Area', 'United Kingdom', 'Mexico', 'India', 'Philippines', 'Thailand', 'Indonesia'];
export const LAST_VERIFIED = 'November 2026';
export const LEVELS = ['OK', 'WATCH', 'CRITICAL', 'BREACH'];
export const PILLARS = ['ss', 'pe', 'visa'];
export const PILLAR_TITLES = { ss: 'Pillar 1: Social Security', pe: 'Pillar 2: PE & Tax', visa: 'Pillar 6: Visa & Stay' };

const HOST = {
  'Schengen Area': {
    visa: { limit: 90, conf: 'verified', short: '90 days in any rolling 180 (EES biometric tracking; ETIAS expected late 2026, confirm start date)', pathway: 'Visa-free short stay, or a national remote-work / digital nomad visa where offered', milestones: [] },
    tax: { T: 183, conf: 'secondary', short: 'Usually 183 days per tax year, but each member state sets its own tests (a permanent home or family ties can create residency from day one)' },
    peBase: 'High', payroll: 145, entity: 4500,
  },
  'United Kingdom': {
    visa: { limit: 180, conf: 'verified', short: 'Up to 6 months per visit; ETA required; work for a foreign employer must stay incidental', pathway: 'Standard Visitor (incidental remote work) or Global Business Mobility routes', milestones: [] },
    tax: { T: 183, conf: 'verified', short: 'Statutory Residence Test: 183+ days is automatic residency; for new arrivers 46+ days with 4 ties, 91+ with 3 ties, 121+ with 2 ties can also create residency', milestones: [{ day: 46, lead: 0, label: 'UK SRT: ties test can make this person resident from 46 days' }] },
    peBase: 'High', payroll: 130, entity: 2800,
  },
  Mexico: {
    visa: { limit: 180, conf: 'secondary', short: 'Up to 180 days on a visitor permit (FMM), at the immigration officer’s discretion; visitor status does not allow local work', pathway: 'Visitor (FMM) or Temporary Resident visa (Residente Temporal) for longer stays', milestones: [] },
    tax: { T: 183, conf: 'secondary', short: 'Resident if the main home is in Mexico or the center of vital interests is there; 183+ days is the usual treaty marker', milestones: [] },
    peBase: 'High', payroll: 110, entity: 3200,
  },
  India: {
    visa: { limit: 180, conf: 'verify', short: 'e-Visa required (no visa-free entry). Stay per visit depends on visa type, commonly up to 180 days on e-Business; local work is not allowed', pathway: 'e-Business visa for visits; Employment visa for local hires (no digital nomad visa)', milestones: [] },
    tax: { T: 182, conf: 'verify', short: '182+ days in the Indian financial year (Apr 1 to Mar 31), or 60 days plus 365 days over the prior 4 years; service-PE rules are applied firmly', milestones: [] },
    peBase: 'High', payroll: 95, entity: 3800,
  },
  Philippines: {
    visa: { limit: 59, conf: 'secondary', short: '30 days visa-free on arrival, extendable at the Bureau of Immigration to 59 days; extension must be filed before day 30', pathway: '9A tourist extension or 9G pre-arranged employment visa', milestones: [{ day: 30, lead: 7, label: 'File Bureau of Immigration extension before day 30' }] },
    tax: { T: 180, conf: 'verify', short: 'Over 180 days in a calendar year changes an alien’s tax status; pay for work performed in the Philippines is treated as Philippine-source income', milestones: [] },
    peBase: 'Moderate', payroll: 90, entity: 3500,
  },
  Thailand: {
    visa: { limit: 60, conf: 'secondary', short: 'Visa-free stay cut to 30 days from 15 Sep 2026 for many nationalities, extendable once by 30 days (60 total); confirm current list', pathway: 'Destination Thailand Visa (DTV, up to 180 days per entry) or Non-Immigrant B with work permit', milestones: [{ day: 30, lead: 7, label: 'Extend stay before day 30 or exit' }] },
    tax: { T: 180, conf: 'secondary', short: '180+ days in a calendar year makes a person Thai tax resident; foreign income remitted to Thailand is taxable for residents since 2024', milestones: [] },
    peBase: 'Moderate', payroll: 100, entity: 3600,
  },
  Indonesia: {
    visa: { limit: 60, conf: 'secondary', short: 'Visa on arrival: 30 days, extendable once by 30 days (60 total); tourist status does not allow work', pathway: 'E33G remote worker KITAS or PT PMA with work KITAS', milestones: [{ day: 30, lead: 7, label: 'Extend visa on arrival before day 30' }] },
    tax: { T: 183, conf: 'verify', short: 'Over 183 days in any 12-month period, or intent to stay, makes a person Indonesian tax resident', milestones: [] },
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
    'Schengen Area': { covered: true, form: 'SSA Certificate of Coverage (online request)', months: 60, conf: 'secondary', note: 'The US has agreements with most, not all, Schengen states (usually up to 5 years). Confirm your specific country.' },
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

const ROLE_FACTOR = { 'Sales / Revenue': 0.33, Executive: 0.33, 'Manager / Team Lead': 0.67 };
const SS_CERT = { 'Not filed': [15, 30, 60], Filed: [30, 60, 90] }; // policy: [watch, critical, breach] days

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

export function pillarCell(home, host, pillar, { role = 'Individual Contributor', cert = 'Not filed' } = {}) {
  const h = HOST[host];
  const base = { pillar, home, host, title: PILLAR_TITLES[pillar], lastVerified: LAST_VERIFIED, milestones: [] };
  if (pillar === 'visa') {
    return { ...base, ...bounds(h.visa.limit), rule: h.visa.short, detail: h.visa.pathway, conf: h.visa.conf, milestones: h.visa.milestones };
  }
  if (pillar === 'pe') {
    const A = h.peBase === 'High' ? Math.round(h.tax.T * 0.75) : h.tax.T;
    const limit = Math.min(h.tax.T, Math.max(15, Math.round(A * (ROLE_FACTOR[role] ?? 1))));
    return { ...base, ...bounds(limit), rule: h.tax.short, detail: `Base PE risk: ${h.peBase}. Role "${role}" sets the alert limit to ${limit} days. ${HOME_TAX[home]}`, conf: h.tax.conf, milestones: h.tax.milestones || [] };
  }
  const s = SS[home][host];
  if (s.covered) {
    const months = s.months;
    if (cert === 'Issued') return { ...base, ...bounds(months * 30), rule: s.form, detail: `Certificate issued. Up to ${months} months initial detachment. ${s.note}`, conf: s.conf, covered: true };
    const [w, c, l] = SS_CERT[cert] || SS_CERT['Not filed'];
    return { ...base, limit: l, watchAt: w, criticalAt: c, rule: s.form, detail: `Certificate ${cert.toLowerCase()}. ${s.note}`, conf: s.conf, covered: true };
  }
  return { ...base, ...bounds(h.tax.T), rule: s.form, detail: s.note, conf: s.conf, covered: false, milestones: [{ day: 30, lead: 0, label: 'No treaty relief: confirm whether host social security applies' }] };
}

const ACTIONS = {
  visa: { OK: 'Within permitted stay.', WATCH: 'Plan an extension or a visa pathway now.', CRITICAL: 'Alert HR: apply for an extension or arrange departure or a work visa.', BREACH: 'Overstay risk: leave or regularise status immediately.' },
  pe: { OK: 'No action needed.', WATCH: 'Review role, contract signing and home-office use in the host country.', CRITICAL: 'Alert HR and tax: limit contracting authority and prepare local payroll or an entity.', BREACH: 'Likely PE or tax residency exposure: engage a tax adviser now.' },
  ss: { OK: 'Coverage position is in order.', WATCH: 'Request the certificate of coverage now (or confirm host contribution rules).', CRITICAL: 'Alert HR: certificate overdue or host contributions likely; act this week.', BREACH: 'Dual contribution exposure: file the certificate or move to local payroll.' },
};

export function evaluatePillars(emp) {
  const home = emp.homeCountry === 'Canada' ? 'Canada' : 'United States';
  const host = HOST[emp.hostRegion] ? emp.hostRegion : HOSTS[0];
  const days = Number(emp.daysUsed) || 0;
  const out = {};
  PILLARS.forEach((p) => {
    const c = pillarCell(home, host, p, { role: emp.role, cert: emp.certificateStatus || 'Not filed' });
    const level = levelFor(days, c, c.milestones);
    const ms = c.milestones.find((m) => days >= m.day - (m.lead ?? 7) && days < c.limit);
    out[p] = { ...c, level, days, action: ms && level === 'WATCH' ? `${ms.label}. ${ACTIONS[p][level]}` : ACTIONS[p][level] };
  });
  return out;
}

export function hostSummary(host) {
  const h = HOST[host] || HOST[HOSTS[0]];
  return { visaLimitDays: h.visa.limit, visaRuleShort: h.visa.short, visaPathway: h.visa.pathway, taxResidencyDays: h.tax.T, taxRuleShort: h.tax.short, peBaseRisk: h.peBase, localPayrollMonthlyUSD: h.payroll, entitySetupOneTimeUSD: h.entity, lastVerified: LAST_VERIFIED };
}

export const worstLevel = (ps) => PILLARS.map((p) => ps[p].level).reduce((a, b) => (rank(b) > rank(a) ? b : a), 'OK');
export const buildMatrix = () => HOMES.flatMap((hm) => HOSTS.flatMap((ht) => PILLARS.map((p) => pillarCell(hm, ht, p))));
