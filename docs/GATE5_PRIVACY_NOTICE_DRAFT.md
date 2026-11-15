# OrbitalHR Privacy Notice — DRAFT, NOT APPROVED FOR PUBLICATION
**Draft date:** 15 November 2026  
**Status:** Internal legal/technical review. Replace every [PLACEHOLDER] and validate actual practices before publication.

## 1. Who operates OrbitalHR
OrbitalHR is an international HR compliance-screening software service currently operated by **[FULL LEGAL NAME OF CURRENT INDIVIDUAL OPERATOR]**, doing business as **[REGISTERED BUSINESS NAME, IF APPLICABLE]**, at **[SERVICE ADDRESS / CONTACT ADDRESS IN ONTARIO]**. A Canadian corporation is planned but **has not yet been incorporated**. Do not represent a future corporation as the present operator.

**Privacy Officer:** Founder (initial designation).  
**Contact:** ismailbenamira1@gmail.com.  
**Effective date after approval:** [DATE].

## 2. Scope and roles
This notice covers visitors, prospective customers, and account holders of OrbitalHR. Business customers may upload employee information for mobility/compliance screening. In that context, the customer typically determines the purpose and authorization for providing workforce records, while OrbitalHR processes customer-provided information to deliver the service, subject to the customer agreement and applicable laws. The precise legal roles under each relevant jurisdiction must be reviewed, not assumed by label alone.

## 3. Information we handle
- **Account and sign-in:** work email, Supabase account identifier and authentication/session information.
- **Customer employee roster:** employee name, home country, destination country/region, job role, recorded stay days, payroll arrangement, visa/stay extension status, social-security certificate status, associated timestamps, and derived compliance-screening results. Customers must not upload passport scans, government ID numbers, birth dates, health details, salary records or other sensitive material unless a reviewed feature specifically requires and protects it.
- **AI feature inputs:** customer questions and recent chat history, relevant employee screening fields and derived flags. The server substitutes saved employee names with aliases and excludes database IDs from structured model inputs; obvious contacts/identifiers in text are filtered. **This is pseudonymization, not guaranteed anonymization**: travel, role and free-form text may still identify a person.
- **Early access:** company name, business email, company size, requested host countries, and submission time.
- **Anti-abuse and service operations:** Cloudflare Turnstile verification, security events, and keyed hashed IP/email rate-limit counters. Cloudflare and infrastructure providers may separately handle connection logs, IP addresses or request metadata under their practices. Actual log categories and retention require verification.

## 4. Why we use information
We use information to authenticate users, maintain customer-scoped rosters, calculate internal screening alerts, generate optional AI explanations and employee briefs, respond to support/privacy requests, manage requested early-access contact, secure systems, investigate abuse and meet legal obligations. Do not use customer employee data for targeted advertising, reselling, or independent AI training without an explicit, lawful, separately documented authorization.

Outputs are **screening indicators only**, not legally verified determinations, permission to work, immigration advice, or tax/social-security clearance.

## 5. Customers' responsibilities and individual notice
Customers must have an appropriate legal basis/authority to supply employee data, provide required notices and obtain consents where necessary, restrict user access, ensure data accuracy, and respond to employee rights requests in coordination with OrbitalHR. OrbitalHR should not assert that a customer's authorization substitutes for all applicable individual privacy obligations.

## 6. Service providers, AI and international processing
- **Supabase:** authentication and database hosting; verify project region and executed contract/data-processing terms.
- **Cloudflare:** hosting, Pages Functions, Turnstile and security infrastructure; verify geographic routing/logging, privacy terms and subprocessors.
- **Google Gemini:** currently configured AI generation where enabled, through server-side requests. AI inputs are minimized but may still contain personal information. If the alternative Anthropic integration is enabled, update this notice accordingly.
Data may be processed outside Canada depending on actual service configuration and vendors. Before publication, document hosting regions, recipient organizations, vendor retention, training use, safeguards, access and international-transfer risks. Do not claim Canadian-only storage, zero retention or no model training until contractually verified.

## 7. Safeguards
Current technical measures include authenticated AI endpoints, owner-scoped database row-level security for saved rosters, server-side validation, limited AI request quotas, Turnstile and rate-limited early-access submissions. These reduce risk but do not guarantee absolute security. Before real employee-data onboarding, verify access management, monitoring, backup/restore, incident response, vendor terms and deletion implementation.

## 8. Retention and deletion
**POLICY DECISION — NOT YET IMPLEMENTED:** After verified account closure, employee roster records will be deleted from the active database within **30 calendar days** of closure. A secure closure workflow, access cutoff, automated deletion and completion verification have not yet been built or tested. Define separate periods for leads, security counters, AI request traces, service logs and backups; identify automated expiry and deletion workflow. Existing code does **not** establish a completed organization-wide retention/deletion program. We will retain information only as necessary for specified purposes and applicable legal duties once the schedule is implemented. Until that work is done, this notice is **not ready to publish**.

## 9. Access, correction, complaints and deletion inquiries
Individuals may contact ismailbenamira1@gmail.com to ask about access, accuracy, corrections, applicable deletion rights, or a privacy complaint. If OrbitalHR processes an employee record on behalf of a customer, coordinate with that customer's designated representative and verify the requester's identity before disclosure. Specify response timelines and internal procedures after legal review.

## 10. Breaches
We will investigate suspected privacy/security incidents, contain harm, and make legally required notifications and records under applicable law. Define and test an incident response process before production customer use; do not claim a notification SLA that is not operationally supported.

## 11. Updates
We may update this notice to reflect changes in operators, functions and service providers. Material changes must be communicated as required by law. Publish an effective date and accessible previous versions where appropriate.

---
**Before publication:** current legal operator identity/contact, legal basis and customer roles, AI/vendor contracts and geographic processing, retention/deletion implementations, incident plan, CASL marketing consent design, jurisdiction-specific review and customer terms must be signed off. This draft itself is not evidence of compliance.
