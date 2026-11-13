export type HomeCountry = 'US' | 'CA';
export type HostRegion =
  | 'UK'
  | 'Schengen'
  | 'Mexico'
  | 'India'
  | 'Philippines'
  | 'Thailand'
  | 'Indonesia';

export interface CorridorRule {
  id: string;
  homeCountry: HomeCountry;
  hostRegion: HostRegion;
  // Feature 1: EOR Graduation Cost Engine
  eorAvgMonthlyFeeUSD: number;
  entitySetupCostUSD: number;
  entityMonthlyMaintenanceUSD: number;
  eorGraduationThreshold: number; // Headcount where entity beats EOR
  // Feature 2: Live Risk Matrix (PE & Social Security)
  totalizationAgreement: boolean;
  certificateType: string;
  dualSocialTaxRisk: 'Low' | 'High';
  employerSocialTaxRate: number;
  peRiskLevel: 'Low' | 'Medium' | 'High';
  peTriggerNote: string;
  // Feature 3: Roster Day-Count & Immigration Compliance
  visaMaxDays: number;
  visaWarningDays: number;
  visaRuleLabel: string;
}

export const COMPLIANCE_MATRIX: Record<string, CorridorRule> = {
  // ================= UNITED STATES HOME CORRIDORS =================
  US_UK: {
    id: 'US_UK',
    homeCountry: 'US',
    hostRegion: 'UK',
    eorAvgMonthlyFeeUSD: 599,
    entitySetupCostUSD: 8500,
    entityMonthlyMaintenanceUSD: 1400,
    eorGraduationThreshold: 5,
    totalizationAgreement: true,
    certificateType: 'US SSA Certificate of Coverage (UK/USA)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.138,
    peRiskLevel: 'Medium',
    peTriggerNote: 'UK HMRC scrutinizes dependent agents & senior commercial leads.',
    visaMaxDays: 180,
    visaWarningDays: 150,
    visaRuleLabel: 'UK Standard Visitor (180 days max per visit)'
  },
  US_Schengen: {
    id: 'US_Schengen',
    homeCountry: 'US',
    hostRegion: 'Schengen',
    eorAvgMonthlyFeeUSD: 650,
    entitySetupCostUSD: 14000,
    entityMonthlyMaintenanceUSD: 2100,
    eorGraduationThreshold: 6,
    totalizationAgreement: true,
    certificateType: 'US SSA Certificate of Coverage (Bilateral EU)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.21,
    peRiskLevel: 'Medium',
    peTriggerNote: 'Fixed place of business or contract-closing authority triggers corporate PE.',
    visaMaxDays: 90,
    visaWarningDays: 75,
    visaRuleLabel: 'Schengen 90/180-Day Rolling Window'
  },
  US_Mexico: {
    id: 'US_Mexico',
    homeCountry: 'US',
    hostRegion: 'Mexico',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 9500,
    entityMonthlyMaintenanceUSD: 1500,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — No US-Mexico Totalization Agreement in Force',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.24,
    peRiskLevel: 'High',
    peTriggerNote: 'Strict REPSE subcontracting rules + 183-day tax residency trigger.',
    visaMaxDays: 180,
    visaWarningDays: 150,
    visaRuleLabel: 'FMM Visitor Limit (180 days max; no local payroll)'
  },
  US_India: {
    id: 'US_India',
    homeCountry: 'US',
    hostRegion: 'India',
    eorAvgMonthlyFeeUSD: 399,
    entitySetupCostUSD: 7500,
    entityMonthlyMaintenanceUSD: 1200,
    eorGraduationThreshold: 4,
    totalizationAgreement: false,
    certificateType: 'None — Mandatory EPF/International Worker Contribution Risk',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.12,
    peRiskLevel: 'High',
    peTriggerNote: 'High service & dependent-agent PE enforcement for R&D/sales hubs.',
    visaMaxDays: 90,
    visaWarningDays: 75,
    visaRuleLabel: 'e-Business Visa (90-day continuous stay cap)'
  },
  US_Philippines: {
    id: 'US_Philippines',
    homeCountry: 'US',
    hostRegion: 'Philippines',
    eorAvgMonthlyFeeUSD: 399,
    entitySetupCostUSD: 8000,
    entityMonthlyMaintenanceUSD: 1100,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — Dual FICA + SSS/PhilHealth Exposure',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.11,
    peRiskLevel: 'Medium',
    peTriggerNote: '183-day aggregate presence or local management control triggers PE.',
    visaMaxDays: 59,
    visaWarningDays: 45,
    visaRuleLabel: '30-Day Visa-Free + First Extension (59 days)'
  },
  US_Thailand: {
    id: 'US_Thailand',
    homeCountry: 'US',
    hostRegion: 'Thailand',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 11000,
    entityMonthlyMaintenanceUSD: 1500,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — Dual FICA + Thai SSO Exposure',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.05,
    peRiskLevel: 'High',
    peTriggerNote: 'Strict Foreign Business Act & work permit rules; DTV visa restricts local work.',
    visaMaxDays: 60,
    visaWarningDays: 45,
    visaRuleLabel: '60-Day Visa Exemption (Non-Immigrant B required for work)'
  },
  US_Indonesia: {
    id: 'US_Indonesia',
    homeCountry: 'US',
    hostRegion: 'Indonesia',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 12500,
    entityMonthlyMaintenanceUSD: 1650,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — Dual FICA + BPJS Mandatory Coverage',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.105,
    peRiskLevel: 'High',
    peTriggerNote: '183-day tax residency + strict KITAS/B211A commercial activity boundaries.',
    visaMaxDays: 60,
    visaWarningDays: 45,
    visaRuleLabel: 'VOA / B211A Visitor Limit (60 days initial)'
  },

  // ================= CANADA HOME CORRIDORS =================
  CA_UK: {
    id: 'CA_UK',
    homeCountry: 'CA',
    hostRegion: 'UK',
    eorAvgMonthlyFeeUSD: 599,
    entitySetupCostUSD: 8500,
    entityMonthlyMaintenanceUSD: 1400,
    eorGraduationThreshold: 5,
    totalizationAgreement: true,
    certificateType: 'CRA CPT56 Certificate of Coverage (Canada-UK)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.138,
    peRiskLevel: 'Medium',
    peTriggerNote: 'UK HMRC scrutinizes dependent agents & senior commercial leads.',
    visaMaxDays: 180,
    visaWarningDays: 150,
    visaRuleLabel: 'UK Standard Visitor (180 days max per visit)'
  },
  CA_Schengen: {
    id: 'CA_Schengen',
    homeCountry: 'CA',
    hostRegion: 'Schengen',
    eorAvgMonthlyFeeUSD: 650,
    entitySetupCostUSD: 14000,
    entityMonthlyMaintenanceUSD: 2100,
    eorGraduationThreshold: 6,
    totalizationAgreement: true,
    certificateType: 'CRA CPT Certificate of Coverage (Canada-EU Bilateral)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.21,
    peRiskLevel: 'Medium',
    peTriggerNote: 'Fixed place of business or contract-closing authority triggers corporate PE.',
    visaMaxDays: 90,
    visaWarningDays: 75,
    visaRuleLabel: 'Schengen 90/180-Day Rolling Window'
  },
  CA_Mexico: {
    id: 'CA_Mexico',
    homeCountry: 'CA',
    hostRegion: 'Mexico',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 9500,
    entityMonthlyMaintenanceUSD: 1500,
    eorGraduationThreshold: 5,
    totalizationAgreement: true,
    certificateType: 'CRA CPT110 Certificate of Coverage (Canada-Mexico)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.24,
    peRiskLevel: 'High',
    peTriggerNote: 'CPP/QPP exempted via CPT110, but REPSE subcontracting rules still apply.',
    visaMaxDays: 180,
    visaWarningDays: 150,
    visaRuleLabel: 'FMM Visitor Limit (180 days max; no local payroll)'
  },
  CA_India: {
    id: 'CA_India',
    homeCountry: 'CA',
    hostRegion: 'India',
    eorAvgMonthlyFeeUSD: 399,
    entitySetupCostUSD: 7500,
    entityMonthlyMaintenanceUSD: 1200,
    eorGraduationThreshold: 4,
    totalizationAgreement: true,
    certificateType: 'CRA CPT166 Certificate of Coverage (Canada-India)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.12,
    peRiskLevel: 'High',
    peTriggerNote: 'CPT166 exempts Indian EPF for up to 60 months; service PE risk remains high.',
    visaMaxDays: 90,
    visaWarningDays: 75,
    visaRuleLabel: 'e-Business Visa (90-day continuous stay cap)'
  },
  CA_Philippines: {
    id: 'CA_Philippines',
    homeCountry: 'CA',
    hostRegion: 'Philippines',
    eorAvgMonthlyFeeUSD: 399,
    entitySetupCostUSD: 8000,
    entityMonthlyMaintenanceUSD: 1100,
    eorGraduationThreshold: 5,
    totalizationAgreement: true,
    certificateType: 'CRA CPT124 Certificate of Coverage (Canada-Philippines)',
    dualSocialTaxRisk: 'Low',
    employerSocialTaxRate: 0.11,
    peRiskLevel: 'Medium',
    peTriggerNote: 'CPT124 prevents dual CPP/SSS contributions; watch 183-day PE threshold.',
    visaMaxDays: 59,
    visaWarningDays: 45,
    visaRuleLabel: '30-Day Visa-Free + First Extension (59 days)'
  },
  CA_Thailand: {
    id: 'CA_Thailand',
    homeCountry: 'CA',
    hostRegion: 'Thailand',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 11000,
    entityMonthlyMaintenanceUSD: 1500,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — No Canada-Thailand Social Security Agreement',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.05,
    peRiskLevel: 'High',
    peTriggerNote: 'Strict Foreign Business Act & work permit rules; DTV visa restricts local work.',
    visaMaxDays: 60,
    visaWarningDays: 45,
    visaRuleLabel: '60-Day Visa Exemption (Non-Immigrant B required for work)'
  },
  CA_Indonesia: {
    id: 'CA_Indonesia',
    homeCountry: 'CA',
    hostRegion: 'Indonesia',
    eorAvgMonthlyFeeUSD: 499,
    entitySetupCostUSD: 12500,
    entityMonthlyMaintenanceUSD: 1650,
    eorGraduationThreshold: 5,
    totalizationAgreement: false,
    certificateType: 'None — No Canada-Indonesia Social Security Agreement',
    dualSocialTaxRisk: 'High',
    employerSocialTaxRate: 0.105,
    peRiskLevel: 'High',
    peTriggerNote: '183-day tax residency + strict KITAS/B211A commercial activity boundaries.',
    visaMaxDays: 60,
    visaWarningDays: 45,
    visaRuleLabel: 'VOA / B211A Visitor Limit (60 days initial)'
  }
};

// Curated Executive Demo Presets (Clean UI for Live Sales Calls)
export const DEMO_SCENARIOS = [
  {
    label: 'US Tech Scaling UK Team (6 Hires)',
    corridorId: 'US_UK',
    headcount: 6,
    avgSalaryUSD: 115000,
    daysAbroad: 120
  },
  {
    label: 'Canadian SaaS Expanding to Mexico (7 Hires)',
    corridorId: 'CA_Mexico',
    headcount: 7,
    avgSalaryUSD: 68000,
    daysAbroad: 90
  },
  {
    label: 'US R&D Hub in India (5 Hires — Dual Tax Alert)',
    corridorId: 'US_India',
    headcount: 5,
    avgSalaryUSD: 55000,
    daysAbroad: 95
  },
  {
    label: 'EU Schengen Rotation (3 Hires — 90-Day Limit)',
    corridorId: 'US_Schengen',
    headcount: 3,
    avgSalaryUSD: 105000,
    daysAbroad: 92
  }
];
export function evaluateCorridorBoundary(
  corridorKey: string,
  headcount: number,
  daysAbroad: number
) {
  const rule = COMPLIANCE_MATRIX[corridorKey];
  if (!rule) return null;

  // Boundary 1: Visa / Day-Count Status (e.g., 89 vs 91 days in Schengen)
  let visaStatus: 'Safe' | 'Warning' | 'Exceeded' = 'Safe';
  if (daysAbroad > rule.visaMaxDays) {
    visaStatus = 'Exceeded';
  } else if (daysAbroad >= rule.visaWarningDays) {
    visaStatus = 'Warning';
  }

  // Boundary 2: EOR vs. Owned Entity Graduation (e.g., 4 vs 6 hires)
  const shouldGraduateToEntity = headcount >= rule.eorGraduationThreshold;

  return {
    rule,
    visaStatus,
    daysRemaining: rule.visaMaxDays - daysAbroad,
    shouldGraduateToEntity,
    recommendation: shouldGraduateToEntity
      ? `Graduate to local entity (${headcount} hires exceeds ${rule.eorGraduationThreshold}-hire EOR threshold)`
      : `Stay on EOR (${rule.eorGraduationThreshold - headcount} hires below entity break-even)`
  };
}
