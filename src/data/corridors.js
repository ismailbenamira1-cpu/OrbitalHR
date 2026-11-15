// src/data/corridors.js
// OrbitalHR - Cross-Border Tax, Immigration, and Social Security Corridor Data
// Verified and updated per Adviser Review List (Nov 2026 annotations)
// Includes all 12 cases and explicit PE Risk Trigger Thresholds applying the 75% policy factor.

export const CORRIDORS = {
  "India": {
    country: "India",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 180,
      type: "e-Business / e-Tourist Visa",
      conf: "verified",
      text: "Continuous stay per visit capped at 180 days. FRRO registration required beyond 180 days. e-Tourist 1-yr/5-yr capped at 180 days per calendar year. e-Visa is not valid for employment; remote work for a foreign employer is not expressly permitted."
    },
    tax: {
      alertT: 90,
      peAlertThresholdDays: 68,
      residencyRule: "Resident if 182+ days in the tax year (s.6 Income-tax Act 2025, in force Apr 2026), or 60+ days plus 365+ days in preceding 4 years.",
      peRule: "India-US and India-Canada DTAA service PE threshold is more than 90 days in any 12-month period (personnel days aggregated).",
      conf: "verified (residency) / secondary (PE)",
      prompt: "Does the employee have Indian citizenship/PIO status or Indian-source income exceeding INR 15 lakh?",
      note: "Service PE alert base is 90 days; high-risk PE alert triggers at 68 days under the 75% policy factor."
    },
    socialSecurity: {
      agreement: true,
      note: "Totalization agreement active with US/Canada. Detached worker provisions apply."
    }
  },

  "Philippines": {
    country: "Philippines",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 59,
      type: "Visa-free 30 days + 29-day waiver",
      conf: "verified",
      text: "30 days visa-free under EO 408; first extension of 29 days brings total to 59 days. Further extensions require an ACR I-Card (up to 36 months)."
    },
    tax: {
      alertT: 90,
      peAlertThresholdDays: 90,
      residencyRule: "Taxable on Philippine-source income from day one (NIRC s.42). 180 days or fewer = flat 25% final tax; > 180 days = graduated rates (0-35%).",
      peRule: "Dependent services treaty exemption restricted (90 days under US treaty practice or 183 days; employer must be foreign with no local PE/bearer).",
      conf: "secondary",
      prompt: "Is compensation tied to services physically performed within the Philippines?",
      note: "Tax and PE alert base set at 90 days; high-risk PE alert triggers at 90 days."
    },
    socialSecurity: {
      agreement: false,
      note: "No totalization agreement currently in force."
    }
  },

  "Indonesia": {
    country: "Indonesia",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 60,
      type: "Visa on Arrival (VOA) / e-VOA",
      conf: "verified",
      text: "30 days VOA or e-VOA, extendable once by 30 days (60 days maximum total). No second extension allowed; must exit after 60 days."
    },
    tax: {
      alertT: 120,
      peAlertThresholdDays: 90,
      residencyRule: "Resident if present > 183 days in any 12 months, or intent to reside (evidenced by KITAP, stay permit, work/business contract > 183 days, lease, or family relocation; e.g., 1-year E33G permit triggers residency from arrival).",
      peRule: "US and Canada tax treaties set service PE and employment-income exemption at > 120 days in any 12 months.",
      conf: "verified (residency) / secondary (PE)",
      prompt: "Does the employee hold a permit, lease, or contract exceeding 183 days or have relocated family to Indonesia?",
      note: "PE alert base set at 120 days; high-risk PE alert triggers at 90 days under the 75% policy factor."
    },
    socialSecurity: {
      agreement: false,
      note: "No totalization agreement currently in force."
    }
  },

  "Mexico": {
    country: "Mexico",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 180,
      type: "Visitor Permit (FMM / Digital FMM)",
      conf: "verified",
      text: "Legal ceiling is 180 uninterrupted days, but immigration officers at entry determine actual days granted (often fewer, especially for repeat visitors). No paid work in Mexico."
    },
    tax: {
      alertT: 183,
      peAlertThresholdDays: 137,
      residencyRule: "CFF art. 9: Resident if established a home (casa habitación) in Mexico. If home also exists elsewhere, resident if centre of vital interests is in Mexico (> 50% Mexican-source income or main professional base).",
      peRule: "183 days in 12 months serves as a treaty employment-income marker, not a domestic day-count residency test.",
      conf: "secondary",
      prompt: "Has the employee established a home (owned/rented) or relocated family to Mexico, or derive >50% income from Mexican sources?",
      note: "Home-test questions gate the PE & tax pillar; high-risk PE alert triggers at 137 days under the 75% policy factor."
    },
    socialSecurity: {
      agreement: true,
      note: "Totalization agreement in force with US and Canada."
    }
  },

  "Thailand": {
    country: "Thailand",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 60,
      type: "Visa Exemption (Royal Gazette effective 15 Sep 2026)",
      conf: "verified",
      text: "30 days visa-free under Royal Gazette notice effective 15 Sep 2026. Requires proof of 20,000 THB funds per person (40,000 THB per family). 30-day extension is strictly at the immigration officer's discretion."
    },
    tax: {
      alertT: 180,
      peAlertThresholdDays: 135,
      residencyRule: "Resident if 180+ days in the tax year (Revenue Code s.41). Foreign income earned from 1 Jan 2024 onward while resident is taxable when remitted in any year.",
      peRule: "Standard treaty PE and employment rules apply; remittance-based taxation applies to foreign-sourced earnings.",
      conf: "secondary",
      prompt: "Is foreign-sourced income being remitted into Thailand during a residency year (180+ days)?",
      note: "Same-year / next-year remittance relief decree remains draft status; high-risk PE alert triggers at 135 days."
    },
    socialSecurity: {
      agreement: false,
      note: "No totalization agreement currently in force."
    }
  },

  "Schengen Area": {
    country: "Schengen Area (Model States: Germany, France, Spain)",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 90,
      type: "Schengen 90/180-day rolling rule",
      conf: "verified",
      text: "Maximum 90 days in any 180-day rolling period across the Schengen zone for visitor/business travel."
    },
    tax: {
      alertT: 183,
      peAlertThresholdDays: 137,
      residencyRule: "Each state enforces domestic triggers: Germany (Wohnsitz AO s.8 dwelling or habitual abode AO s.9 > 6 months), France (CGI art. 4B home/household, principal stay, professional or economic interests), Spain (LIRPF art. 9 > 183 days, economic interests, or resident spouse/dependent minor children).",
      peRule: "Treaty 183-day rule applies for employment income; domestic residence rules take precedence.",
      conf: "secondary",
      prompt: "Does the employee have a permanent dwelling, primary family household, or vital economic ties in Germany, France, or Spain?",
      note: "Model-first states evaluated individually for domestic triggers; high-risk PE alert triggers at 137 days."
    },
    socialSecurity: {
      agreement: true,
      note: "US totalization agreements cover most Schengen states. Non-agreement states (by subtraction): Bulgaria, Croatia, Estonia, Latvia, Liechtenstein, Lithuania, Malta. Romania agreement entered into force 1 Sep 2026."
    }
  },

  "United Kingdom": {
    country: "United Kingdom",
    homeCountries: ["US", "Canada"],
    visa: {
      limitDays: 180,
      type: "Standard Visitor Visa / Permitted Activities",
      conf: "verified",
      text: "Up to 180 days per visit for standard visitor activities. Permitted remote working is strictly ancillary to overseas employment."
    },
    tax: {
      alertT: 183,
      peAlertThresholdDays: 137,
      residencyRule: "Statutory Residence Test (SRT): Automatic overseas tests, automatic UK tests, and sufficient ties test based on days and ties.",
      peRule: "Branch or agency / PE rules apply if sustained physical presence or fixed place of business is maintained.",
      conf: "verified",
      prompt: "How many ties (family, accommodation, work, 90-day tie) does the employee hold in the UK?",
      note: "Full SRT tie-mapping applies; high-risk PE alert triggers at 137 days."
    },
    socialSecurity: {
      agreement: true,
      note: "US-UK and Canada-UK totalization agreements active up to 5 years."
    }
  }
};
