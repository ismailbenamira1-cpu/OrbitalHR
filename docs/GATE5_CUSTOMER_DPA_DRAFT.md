# OrbitalHR Customer Data Processing Agreement — DRAFT / NOT FOR SIGNATURE
**Draft date:** 15 November 2026. Intended for counsel review and negotiation before first real customer onboarding.

## Parties and precedence
This Data Processing Agreement (“DPA”) is proposed between:
- **Customer:** [LEGAL CUSTOMER ENTITY NAME AND ADDRESS].
- **Service provider:** [CURRENT LEGAL OPERATOR NAME AND ADDRESS], offering the OrbitalHR product (the planned Canadian company is not yet incorporated). **Privacy inquiries contact:** ismailbenamira1@gmail.com.

The parties' final commercial agreement and applicable privacy laws govern where this document is silent. This draft must not be treated as an executed contract.

## 1. Roles, purpose and instructions
For customer-provided workforce records, Customer determines lawful purposes and authorizes use and disclosure; Service Provider processes that data to provide authenticated roster management, mobility/compliance screening, customer-requested AI summaries, security, support and customer-controlled deletion, only under documented instructions and applicable law. Party roles can vary by context and jurisdiction and must be confirmed in the final agreement.

Service Provider shall not sell Customer Personal Data, independently market to employees using it, or deliberately use it to train unrelated models. Customer shall ensure lawful authority, notices and any necessary consents for the data submitted.

## 2. Subject matter, duration and categories (Schedule A)
**Services:** OrbitalHR employee roster, cross-border screening, and AI-assisted brief generation.  
**Individuals:** Customer employees, assigned users and relevant business contacts.  
**Personal data:** employee names, home/host jurisdiction, role, stay days, payroll arrangement, visa extension and treaty-certificate status, internal screening indicators; account emails and identifiers; customer-submitted questions and authorized AI context.  
**Special limitations:** no passport scans, financial account numbers, medical histories, government ID numbers or similarly high-risk documents without an expressly reviewed extension and heightened controls.  
**Duration:** during service term and approved retention/erasure period [TO AGREE].

## 3. Confidentiality, safeguards and access
Service Provider shall limit data access to authorized personnel and processors with appropriate confidentiality obligations, apply technical/organizational measures proportional to sensitivity, maintain scoped access and authentication, and regularly review security arrangements. **Specific measures and evidence must be attached as Schedule B before signature**, including encryption arrangements, access review, logging/monitoring, incident handling, backup/restore and deletion.

## 4. AI and third-party subprocessors
The service may process reduced employee-screening data through a configured external AI provider. OrbitalHR's code substitutes roster names with aliases and omits database identifiers from structured prompts; this **does not guarantee anonymity**, especially where free-text contains identifiers. Customer must be informed at point of use and be able to understand what is sent.

**Initial known supplier categories (subject to vendor review):**
- Supabase — authentication/database
- Cloudflare — hosting/edge verification/security
- Google Gemini — AI inference, when selected by configuration
- Anthropic — alternative AI integration only if actually configured

Before signature, provide a current subprocessor list, functions, locations, transfer safeguards, training/retention conditions and notification process for material additions or changes. Subprocessor contractual obligations must offer comparable protection.

## 5. Cross-border transfers
Service Provider shall disclose verified processing jurisdictions, assess material cross-border risks and maintain contractual or other comparable protections where required. Do not promise Canada-only residency absent verified infrastructure configuration. Customer is responsible for additional customer-specific jurisdictional restrictions communicated in advance.

## 6. Requests, accuracy and cooperation
Service Provider shall provide reasonable assistance with data access, correction, deletion and regulatory inquiries, consistent with law and customer instructions; validate authority and protect other customers' data. Customer remains responsible for decisions involving employees and will provide necessary context. Agree response channel and deadlines [TO AGREE].

## 7. Security incidents
Service Provider shall investigate, contain and notify Customer of confirmed or reasonably suspected incidents affecting Customer Personal Data without undue delay and within the contractual period [TO AGREE], with sufficient information for Customer to assess legal notifications. Parties will cooperate on regulator/individual notifications as required. **Provisional privacy/incident contact:** ismailbenamira1@gmail.com. Define incident escalation, on-call coverage and contractual notice timelines before signing.

## 8. Deletion, return and retention
Upon authorized termination or request, Service Provider shall return or delete Customer Personal Data, unless retention is required by law or subject to documented backup-cycle limitations. Define operational export formats, deletion milestones, backup treatment, verification process and costs [TO AGREE]. **Policy choice:** employee rosters are to be deleted from the active database no later than **30 calendar days after verified account closure**, but account-closure authorization, access cutoff, automated deletion and end-to-end verification are **not implemented yet**. This provision cannot be promised as an operating service today. Company-wide closure is also not implemented; existing rosters are per individual login.

## 9. Audit, evidence and changes
Service Provider shall make reasonable evidence of controls and third-party compliance available subject to confidentiality and security safeguards. The scope, frequency, costs and mechanism for audits and remediation are [TO AGREE]. Notify material changes in processing and update the record of subprocessors.

## 10. Customer account structure and closure scope
The MVP currently stores user-scoped rosters rather than shared organization-owned rosters. The proposed company-level closure and up-to-30-day active-data removal are **future design objectives**, not functionality presently offered. Customer execution requires a reviewed schedule identifying the actual operator, authorized customer administrator, the records covered and an implementable deletion/return mechanism. No company-wide closure representation should be made until it has been tested.

## 11. Limitation of use; product nature
The service offers **screening and workflow alerts**, not binding immigration, tax, employment or social-security determinations. Customers must obtain qualified legal advice before relying on screening outcomes for consequential decisions. Commercial liability, indemnities, insurance and governing-law terms belong in the final services agreement and must be reviewed by counsel.

## Companion drafts
See [Terms of Service](GATE5_TERMS_OF_SERVICE_DRAFT.md), [AI and Acceptable Use](GATE5_ACCEPTABLE_USE_AI_NOTICE_DRAFT.md), [Vendor Register](GATE5_VENDOR_SUBPROCESSOR_REGISTER_DRAFT.md), and [Incident Runbook](GATE5_PRIVACY_REQUESTS_AND_INCIDENT_RUNBOOK_DRAFT.md).

## Schedule B — required controls and acceptance evidence (incomplete)
- [x] Owner-scoped Supabase roster RLS and authenticated API access initially tested.
- [x] Turnstile, server-only lead insertion and application rate limiting tested for early-access path.
- [x] AI-facing minimization/pseudonyms in source, automated tests and user-confirmed product function.
- [ ] Actual provider DPA/subprocessor terms, model data-use controls and processing regions verified.
- [ ] Comprehensive organization-wide retention, deletion, backup and restoration procedure tested.
- [ ] Breach notification procedures, contact escalation and reporting owner established.
- [ ] Data exports, customer access management, admin privileges and security controls reviewed.
- [ ] Full privacy/security assessment for accepting real employee data approved.

## Action before use
Fill all bracketed items, complete Schedules A/B and subprocessors list, confirm pre-incorporation operator authority, align with privacy notice and Terms, review with Canadian privacy counsel and assess any extra obligations for non-Canadian customer/employee locations. **Do not publish or present this draft as an executed DPA.**
