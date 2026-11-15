# OrbitalHR — Gate 5 MVP Documentation Package and Deferred Work

**Prepared:** 15 November 2026. **Stage:** Drafting complete / legal-operational acceptance outstanding.
**Founder privacy contact:** ismailbenamira1@gmail.com
**Legal operator:** [CURRENT LEGAL OPERATOR IDENTITY, SERVICE ADDRESS AND BUSINESS STATUS TO CONFIRM]. Future Ontario incorporation is not yet complete.

## Drafted package (not yet published or legally approved)
1. [Privacy Notice](GATE5_PRIVACY_NOTICE_DRAFT.md) — data categories, purpose, user rights, service providers, security and disclosure limits.
2. [Customer Data Processing Agreement](GATE5_CUSTOMER_DPA_DRAFT.md) — customer instructions, confidentiality, security, cross-border processing, incident/rights assistance, vendor schedule, return/deletion terms to negotiate.
3. [Terms of Service](GATE5_TERMS_OF_SERVICE_DRAFT.md) — MVP account structure, screening limitations, customer obligations, commercial/legal clauses requiring completion.
4. [Acceptable Use and AI Notice](GATE5_ACCEPTABLE_USE_AI_NOTICE_DRAFT.md) — AI provider data minimization limits, no legal clearance, prohibited submissions and misuse.
5. [Privacy Request and Security Incident Runbook](GATE5_PRIVACY_REQUESTS_AND_INCIDENT_RUNBOOK_DRAFT.md) — intake, verification, response, containment and notification workflow.
6. [Vendor/Subprocessor Register](GATE5_VENDOR_SUBPROCESSOR_REGISTER_DRAFT.md) — Supabase, Cloudflare, Google Gemini and conditional Anthropic.
7. [Early Access / Marketing Contact Notice](GATE5_MARKETING_AND_EARLY_ACCESS_NOTICE_DRAFT.md) — contact purpose, separate optional newsletter consent, CASL requirements.
8. [AI technical minimization](GATE5_AI_DATA_MINIMIZATION.md) — source-verified model-prompt projection and risks.
9. [Retention/Deletion Design](GATE5_RETENTION_DELETION_PLAN.md) and [Organization Closure Architecture](GATE5_ORGANIZATION_CLOSURE_ARCHITECTURE.md) — **DEFERRED**; future verified company closure and active-roster deletion within 30 days are not deployed.

## Final supporting MVP drafts — completed 15 November 2026
- [Data Processing Record](GATE5_DATA_PROCESSING_RECORD_DRAFT.md) — purpose, data classes, recipients, storage and pending retention.
- [Interim Retention and Erasure SOP](GATE5_INTERIM_RETENTION_AND_ERASURE_SOP_DRAFT.md) — manual request approach and honestly deferred company closure.
- [Privacy Risk Assessment](GATE5_PRIVACY_RISK_ASSESSMENT_DRAFT.md) — risks, controls and residual decisions for identifiable employees.
- [Customer Onboarding and DPA Security Schedule](GATE5_MVP_CUSTOMER_ONBOARDING_AND_SECURITY_SCHEDULE_DRAFT.md) — applicant/customer authorization, minimum safeguards and contractual evidence.
- [Customer Employee Notice Template](GATE5_EMPLOYEE_NOTICE_TEMPLATE_DRAFT.md) — editable employer-facing workforce disclosure.
- [Draft Completion and Approval Register](GATE5_DRAFT_COMPLETION_AND_SIGNOFF.md) — final review checklist and publication/real-data launch prerequisites.

**Drafting status:** COMPLETE for the present MVP scope. **Legal sign-off, functioning manual deletion/request procedures and publication status:** NOT COMPLETE. The remaining tasks are reviews, implementation and operational validation, not missing drafts.

## Website implementation staging
- [Prepared legal page components and footer activation guide](GATE5_WEBSITE_LEGAL_PAGE_STAGING.md). Drafts are not mounted at public routes and approval flag remains disabled; the MVP footer displays only a privacy contact and an 'in preparation' notice. Automated staging tests enforce this boundary.

## Scope of this work
- Documentation work only, including GitHub drafts and checklist. No production schema change, no deletion of existing employee data, no new public legal acceptance UI.
- Current roster model is **per login** with verified owner-scoped RLS, not multi-user company-tenanted.
- The planned organization migration files are staged only, not applied to the live Supabase database.
- AI request minimization is implemented and user smoke-tested, but employee combinations and free-form text can remain identifiable.

## Decision on postponing automated deletion
- **Deferred**: organization account model, company-level verified closure, automated 30-day active-database deletion, complete retention schedule for backups/logs/leads.
- **Cannot defer as a legal claim**: operators must still have appropriate data retention limits, a workable response process for access/correction/erasure, safeguarding and breach practices when personal data is actually collected. Existing single-record delete and a monitored privacy mailbox do not satisfy every scenario.
- Do not promise any automatic organization-wide deletion or fixed backup expiration until implemented and verified.

## Minimum sign-off before real customer identifiable employees
- [ ] Identify present legal operator and business/contact address. Verify business registration requirements; do not describe OrbitalHR as incorporated.
- [ ] Counsel reviews applicable Canadian/foreign privacy and data processing obligations, proposed Terms and DPA for intended client jurisdictions.
- [ ] Establish an actually functioning privacy-request and incident-response workflow, including verification, records, escalation and required notices.
- [ ] Confirm current service provider contracts, AI API processing, data retention/training terms, transfer locations, backup windows and subprocessors.
- [ ] Implement practical customer data return/delete and account termination process even if sophisticated organization automation remains deferred.
- [ ] Agree a lawful, accurate retention/disposal process for actual MVP data; do not treat the prospective 30-day company policy as fulfilled.
- [ ] Verify security posture, access controls, logging, recovery, admin MFA, incident contacts and reasonable provider spending controls.
- [ ] Ensure source-backed screening caveats and no-clearance messaging remain prominent and appropriate legal claims reviewed.
- [ ] Publish reviewed Privacy Notice and Terms with visible site links; obtain appropriate assent to Terms / applicable DPA for business onboarding.
- [ ] Make early-access contact and any optional marketing consent match the actual UI/API data and comply with applicable CASL rules.
- [ ] Test website flow and external links after publication.

## Release status
**Gate 5 documentation drafting: COMPLETE.**
**Gate 5 legal/operational launch authorization: NOT COMPLETE.**
A synthetic-data demo can remain operational; do not interpret finished drafts as permission to accept real employee information without the remaining reasonable privacy and contractual controls.

## Government references
- Office of the Privacy Commissioner of Canada, PIPEDA fair information principles: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/
- OPC accountability and privacy procedures: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_accountability/
- CRTC CASL FAQs: https://crtc.gc.ca/eng/com500/faq500.htm
