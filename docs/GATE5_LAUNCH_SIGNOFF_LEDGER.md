# Gate 5 — MVP launch sign-off ledger (16 November 2026)

**Release objective:** OrbitalHR screening-only MVP. **Decision as of preparation: NO-GO for onboarding identifiable employee rosters.** A fictional-data demonstration may continue subject to prior technical controls. The public early-access form already processes business contact information, so its notice and appropriate retention/contact procedures also matter.

This is the authoritative *operational* list of Gate 5 release blockers. Drafts in [documentation index](GATE5_MVP_DOCUMENTATION_INDEX.md) are not approvals. [Gate 6 final technical checks](GATE6_MVP_OPERATIONAL_READINESS.md) do not override Gate 5.

## First verify the release mode

- **Mode A — public product demo / early-access interest, fictional roster only:** Existing form may collect business email and company details; make sure prospect notice, appropriate marketing contact handling, founder identity, secure inquiry handling, anti-abuse controls and current deployment are confirmed. The roster interface still accepts arbitrary names; a warning is **not** a technical ban on real data.
- **Mode B — actual business customers uploading identifiable employee roster records:** Requires all relevant Gate 5 rows below, including approved privacy/contract terms, real rights/deletion handling, security/vendor diligence and applicable legal review. No blanket claim that all international labor/privacy laws have been certified.
- **Mode C — legally verified country-specific advice:** Out of MVP scope. Would require separate specialist source-by-source legal sign-off, not a Gate 5 policy edit.

## Evidence-based launch blockers

| ID | Required release action | Evidence that closes it | Present evidence / decision |
|---|---|---|---|
| G5-01 | Identify actual present legal operator (individual or registered legal entity), correct service/contact address, jurisdiction and contact route | Founder-confirmed identity and address, registration documents if any; consistent approved policies | **PARTIALLY CLOSED** — Ismail Benamira confirmed individual operator; service/contact address and registration position still open |
| G5-02 | Choose free/demo vs. paid pilot terms, customer eligibility and actual current account model | Signed-off terms describing billing, operator, single-user roster and restricted scope | **OPEN** |
| G5-03 | Approve current Privacy Notice and Terms; ensure truthful data categories, regions, contact details, rights, no unimplemented 30-day promise | Final approved version, date, reviewer and links to accessible live pages | **OPEN**; website has staged, unapproved components |
| G5-04 | Review DPA/security schedule where applicable to business employee records, and make acceptance/contracting process functional | Signed/agreed DPA when needed; accepted Terms version and audit evidence | **OPEN** |
| G5-05 | Verify Cloudflare, Supabase, Google Gemini contract/data terms, processing locations, access/logging, AI retention/training, backups and subprocessors | Account-level terms, approved register with date/URLs/screenshots and transfer assessment | **OPEN**; project database region EU North does not establish all processing geographies |
| G5-06 | Implement and rehearse access, correction, export and deletion workflow for current per-login roster; document Auth/lead/provider-backup limits | Synthetic-account end-to-end dry run; minimal case receipt and scoped deletion/return confirmation | **OPEN**; individual-row deletion exists, wider verified request path untested |
| G5-07 | Document and operate retention/cleanup schedule for saved rosters, leads, hashed rate-limit rows, incident records and backups | Actual schedule with named owner, review cadence, verified manual or automated procedure; supplier limits | **OPEN**; no reliable organization-level automated deletion |
| G5-08 | Rehearse security/privacy incident procedure and verify mailbox MFA, admin access restrictions, backup incident contact, recovery and notification triage | Incident tabletop log and current contact list; no secrets or real personal data copied into GitHub | **OPEN** |
| G5-09 | Verify early-access collection wording and promotional outreach compliance, including CASL basis, sender identity and unsubscribe for commercial marketing | Actual form/notice check, consent evidence and functioning unsubscribe process if marketing is sent | **OPEN** for promotional messaging; lead sign-up flow previously tested |
| G5-10 | Legal/privacy scope review for customer and worker jurisdictions and meaningful customer notice/authority for employee information | Signed review and customer onboarding criteria; any jurisdiction-specific notices | **OPEN** |
| G5-11 | Final privacy acceptance test against deployed pages and authenticated flows without real employee data | Evidence log: live Privacy/Terms link, mobile refresh, Terms acceptance, AI disclosure, lead notice, request intake and test case | **OPEN** |
| G5-12 | Founder/operator release decision, owner sign-off and exceptions | Date, named approver, reviewed version, release mode, decision | **OPEN** |

## Fast closure sequence (no unnecessary engineering)

**Business inputs from founder:** operator confirmed as Ismail Benamira, acting individually (16 November 2026); business/service address and registration requirements still to determine; MVP is no-charge demo, free pilot or paid; intended first customer/worker locations; whether real identifiable employee uploads are to be enabled immediately. Do not include private home address in public GitHub or commit legal PII before the user approves it.

**Vendor proof:** capture applicable account dashboard/terms in an access-restricted location; verify actual live Cloudflare AI provider secret without exposing it; confirm processing and backup language. Only update the public notice from verified facts.

**Operational proof:** conduct fictional user privacy request drill, restricted support mailbox check, authorization test, incident tabletop and deletion/retention review. The future 30-day company-account closure policy stays deferred and cannot be represented as delivered.

**Publish last:** finalize legal copy with real contracting identity; perform appropriate professional review and founder approval; only then activate public /privacy and /terms and record Terms acceptance before allowing real customer roster onboarding.

## Verification rules
- GitHub draft files and checkboxes alone never prove actual operational compliance.
- Never upload actual employee rosters, private service addresses, raw API keys, vendor secret settings or personal incident details to GitHub.
- Do not alter Supabase production Auth users, employee rows or organizations to rehearse deletion.
- Avoid promising automatic 30-day company closure, zero-retention AI or Canadian-only data residency.
- Update this ledger **only** when closure evidence exists; keep a release-specific summary of accepted risks and dated approver.

## Official guidance considered
- OPC PIPEDA accountability: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_accountability/
- OPC fair information principles: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/
- CRTC CASL FAQs: https://crtc.gc.ca/eng/com500/faq500.htm

**Sign-off:** legal operator Ismail Benamira (individual founder; address pending) · Counsel/privacy review [PENDING] · Operational approver [PENDING] · Release decision [NO-GO for identifiable roster].