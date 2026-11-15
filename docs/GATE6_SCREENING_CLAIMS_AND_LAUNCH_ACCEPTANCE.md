# Gate 6 — Screening-scope legal claim review and MVP launch acceptance

**Reviewed:** 15 November 2026 (repository snapshot).  
**Decision:** NOT APPROVED to launch for live identifiable employee records or represent output as legal clearance. The narrowly described screening-only, fictional-data demonstration can proceed subject to technical deployment checks.

## Review scope and limitations
Reviewed customer-facing `src/App.jsx`, source categorization and actions in `src/data/corridors.js`, employee evaluator and Copilot/Employee Brief prompts, existing tests and [MVP launch gate](MVP_LAUNCH_GATE.md). This review is about **accuracy of product claims and warnings**, **not** independent legal validation of all rules. An AI assistant is not a qualified immigration, tax, payroll or social-security adviser.

## High-risk claim findings and code changes
| Original claim/behavior | Risk | Change | Status |
|---|---|---|---|
| "Keep ... employees compliant ... exact day" and "Stop paying $599" | Guarantees legal status and implies a verified payroll-migration date/cost | Replaced with country-specific, screening-only mobility description | Corrected in UI |
| "Verified 2026 Global Tax & Visa Rules" | Implies every modeled legal rule is authoritative/current | Changed to "7 Modeled Destinations · Rules Require Verification" | Corrected in UI |
| "US Totalization & CRA CPT Form Automation" | Form filing/automation not implemented | Changed to agreement/certificate **screening** | Corrected in UI |
| "Custom Country Audit" | Implies professional audit | Changed to country screening | Corrected in UI |
| Future PWN module "to block fines" and labor module "to prevent violations" | Unfounded guarantee of outcomes | Qualified as possible future concepts with no committed availability | Corrected in UI |
| Future modules "currently in closed beta" | Release/readiness assertion not supported | Labeled as concepts, not in current MVP | Corrected in UI |
| Green/OK: "Within permitted stay", "Coverage position is in order", and PE "No action needed" | Can be misread as legal clearance from day counts and certificate flags | Now advises verifying actual permission, tax facts, and coverage with qualified sources | Corrected in rules engine |
| "Last ruleset review: November 2026" / source confidence "verified" | Can imply professional legal approval, not proven for all 42 cells | UI now describes source references, professional review pending; global last-reviewed text removed | Partially mitigated: underlying source metadata retains historical `conf` categories |
| AI prompt disclosure | Previously ambiguous about what reaches provider | UI now describes aliases and free-text reidentification limits | Clarified |
| Screening-only warning at footer | Could be missed while reading bold marketing claims | Added clear above-fold warning beside the primary offer | Corrected in UI |

## Minimum mandatory warnings for a screening product
- **Visible immediately:** "Screening only — not legal advice, immigration/work authorization, a tax determination, or confirmation of social-security compliance. Country-specific facts and qualified adviser review are required before decisions."
- **In outputs:** Any OK/WATCH/CRITICAL/ESCALATE label means an internal triage category, **never official compliance or permission**.
- **In PE:** Day thresholds are Orbital internal policy alerts, not statutory/treaty PE determinations.
- **In tax:** Individual residency requires actual tax-year facts, history, ties and treaty analysis; residency is not a violation.
- **In immigration:** Authorized status and permitted work are separate; visa extensions are not automatically granted. UK visitor remote work is allowed only under restrictions and cannot be the visit's main purpose.
- **In Schengen:** "Schengen Area" is a placeholder for multiple jurisdictions; country-level tax, social security and work-right review is required; 90/180 needs dated travel history.
- **In social security:** Agreements/certificates, actual detachment eligibility and host contribution exposure depend on individual facts; no treaty does not create 30-day legal grace.
- **In commercial outputs:** EOR/local-payroll savings are simplified illustrations, excluding implementation, tax, visas, legal fees and country-specific costs.
- **In AI:** External model explanations may be wrong and pseudonymous descriptions can remain identifying; employee prompts/history must be minimized.

## Legal-source spot check — UK remote work
The UK government's Immigration Rules Appendix Visitor: Permitted Activities, PA 4, permits remote activities relating to employment overseas provided those activities are **not the primary purpose of the UK visit**. A six-month stay possibility does not itself confer a right to work and individual facts matter.
- https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-permitted-activities
- https://www.gov.uk/government/publications/visit-guidance/visit-caseworker-guidance-accessible--2

This spot check supports the **mandatory disclaimer**, not an approval of the UK model's day-count pathways.

## Rules awaiting qualified review: no 42-cell certification
Review by actual home/host, employee nationality and immigration category, entry grant, approved extensions, tax year and residency ties, physical presence history, treaty provisions, employer role and contracting authority, and specific social-security agreements/form and issuance. At a minimum:
1. Immigration: Schengen national work rights; UK visitor activities and actual grant; Mexico entry-assigned stay; India e-Visa vs work; Philippines extensions/work; Thailand/Indonesia visitor vs remote-worker authorization.
2. Corporate PE: treaty/fixed-place/dependent-agent/service PE facts and country-specific thresholds. Internal risk factors are **not legal thresholds**.
3. Individual tax: worldwide-income/residence and relevant exceptions/ties, treaty tie-breakers, payroll withholding.
4. Social security: per-country agreement coverage, detachment periods, certificate validity and host registration.
5. Pricing/ROI: no implication payroll or entity migration is authorized just because estimated fees compare favorably.

**Do not advertise complete legal verification.** A qualified specialist must record the exact law/source, jurisdiction, publication/effective dates, assumptions, limitations and reviewer sign-off before calling any specific result professionally reviewed.

## MVP final acceptance test matrix
| Scenario | Evidence / method | Current disposition |
|---|---|---|
| Anonymous AI request rejected | Read-only live audit / GitHub Actions | Previously checked; re-verify latest deploy |
| Forged bearer or foreign Origin rejected | Read-only live audit | Previously checked; re-verify latest deploy |
| Invalid lead, foreign Origin and empty challenge rejected | Read-only live audit | Previously checked; re-verify latest deploy |
| Signup challenge, server-only insert, throttles | Existing Gate 4 controlled tests | Previously passed tested pathways; no production abuse-exhaustion test |
| Account-scoped roster CRUD and two-account isolation | Earlier Gate 2 user/browser verification | Previously passed; re-test any tenancy change |
| Copilot & Employee Brief output and pseudonymization | User-confirmed Gate 5 smoke / AI tests | Functional tests passed; no legal accuracy certification |
| Marketing text free of clearance/verified/automation guarantees | `tests/gate6-launch-claims.test.js` plus manual review | Updated code; CI final run pending |
| OK output explicitly warns not clearance | `tests/gate6-launch-claims.test.js` | Updated code; CI final run pending |
| Above-fold screening warning | App rendering + browser smoke | Updated code; needs browser check latest commit |
| Production deployment matches final SHA | Cloudflare dashboard/build ID or authoritative deploy metadata | NOT VERIFIED |
| Qualified legal source-by-source review | Specialist sign-off for marketing scope/rules | NOT COMPLETED |
| Privacy/contract/operator, real data handling | Gate 5 approval register | NOT COMPLETED |
| Customer live launch | Signed operational/legal/technical acceptance | **NO-GO** |

## Launch decision by audience
- **Fictional-only local preview/controlled demonstration:** May be used for product feedback subject to no misleading claim and successful technical smoke tests.
- **Public early-access interest collection:** Existing form with protections can continue only if the operator confirms live operation, data notice and relevant communication obligations; do not falsely promise a legal audit.
- **Real employee roster onboarding or legally consequential advice:** **NO-GO** until legal review, Gate 5 data-protection conditions, final launch tests and approval are actually met.
- **Incorporation:** May remain pending as a company milestone, but current operator must be correctly identified and responsible for existing activities; incorporation alone does not complete the privacy review.

## Acceptance record — not yet signed
Founder/technical approver: [PENDING]; professional legal reviewer(s): [PENDING]; production deploy SHA: [PENDING]; review date: [PENDING]; remaining exceptions and compensating controls: [PENDING]. Do not change status to PASS without supporting evidence.
