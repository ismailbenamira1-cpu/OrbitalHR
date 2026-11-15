# OrbitalHR — Customer Onboarding, Security Schedule and Minimum Controls (DRAFT)
**Status:** Proposed operating checklist and attachment for future customer DPA; not an attestation. **Contact:** ismailbenamira1@gmail.com.

## A. Customer onboarding steps
1. Identify the actual current contracting operator and customer business identity, scope, jurisdiction, and authorized customer representative. Do not claim an Ontario corporation already exists.
2. Present the reviewed public Privacy Policy and Terms; record version/date and affirmative acceptance if using a click-through contract. Obtain the customer DPA where required; don't treat a footer link as acceptance.
3. Give the customer appropriate employee-data notice template and confirm they have authority to supply identifiable employee information, including applicable worker notices/consents.
4. Clearly describe current **single-login roster model**, not a multi-user enterprise workspace; no shared organization administration.
5. Explain the scope and limitations of the screening matrix and AI feature, including the provider, possible cross-border processing, pseudonymization limitations and human review requirement.
6. Obtain only supported fields (employee names, route, role, days, payroll and selected visa/SS certificate facts). Discourage unnecessary identity/health/salary uploads and AI free-text identifiers.
7. Confirm account security (unique email sign-in, device security and operational practices); avoid sharing email or login credentials among multiple HR users.
8. Provide monitored privacy/contact route, instructions for correcting/deleting individual entries, and a manual inquiry route for broader access/deletion requests. Do **not** promise self-service company closure.
9. Assess whether customer location or worker geography introduces additional privacy, employment or AI obligations; escalate complex cases for legal review.
10. Confirm current risk acceptance and what is excluded from the MVP; record customer acceptance only after required prerequisites are actually operational.

## B. DPA Schedule — Technical and Organizational Measures
| Control | Intended measure | Current evidence / what to verify |
|---|---|---|
| Confidentiality | Privileged-access restrictions, appropriate commitments for any support personnel | Founder-operated MVP; written procedures and any vendor staff contracts to verify |
| Authentication | Supabase magic-link sign-in; server validates Auth user on AI endpoints | Tested flow, verify production session lifetime and threat mitigation |
| Authorization | RLS limits roster rows to user_id; privileged lead table is service-only | Previously tested owner isolation; verify any new functions and releases |
| Tenant segregation | Individual-account owner isolation only | No company tenancy; do not promise multiuser company isolation |
| Transport/security | HTTPS to web/API providers and secrets kept server-side | Verify provider configuration, no public exposure or sensitive logs |
| Provider AI minimization | Roster name aliases and limited screening projection | Tested for known identifiers; not complete anonymization |
| Abuse protection | Cloudflare Turnstile, limited registration and AI quotas | Tested paths; monitor and manage expired counters |
| Incident response | Founder email, draft runbook | Response drills, notification procedures and escalation still to establish |
| Continuity/backup | Provider-backed hosting and prospective restore plan | Restore test, backup availability, RPO/RTO and deletion treatment not verified |
| Retention/erasure | Individual employee-row deletion is supported | No organization closure, automated 30-day deletion or verified backup expiry |
| Audit/support logs | Restrict sensitive content in logs; protect case metadata | Vendor log categories/retention and access need verification |
| Change management | GitHub tests and deployment audits | Confirm latest production commit and rollback process |

## C. Contract negotiation checklist
- Customer and actual operator legal identities, authorized signatures and business addresses.
- Processing instructions, categories, limits on use, support access, and countries of processing.
- Supplier DPA/subprocessor list, transfer safeguards, incident notification obligations and data rights assistance.
- Retention, backups, legal holds and deletion/return process only as actually supportable.
- Incident reporting/response deadlines compatible with real operational capacity and applicable law.
- Reasonable security audit/evidence mechanism, permitted subcontracting, confidentiality, and liability allocation.

## D. What this schedule DOES NOT certify
No certification (SOC 2/ISO 27001), company-wide tenant isolation, comprehensive penetration test, end-to-end encrypted-at-rest promise beyond verified vendor settings, defined disaster recovery target, certified GDPR compliance, zero-retention AI, or automated full-account erasure has been established. Do not include these as vendor promises without evidence.
