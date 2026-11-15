# OrbitalHR — MVP Personal Data Processing Record (DRAFT)
**Prepared:** 15 November 2026. **Owner:** Founder / initial Privacy Officer. **Privacy contact:** ismailbenamira1@gmail.com. **Status:** Internal record, validate before operating with real employee information.

## 1. Purpose and scope
This record maps observed MVP processing; it is not proof that all vendors or operational logs have been assessed. OrbitalHR operates as a cross-border compliance **screening** application and early-access website. At present records are scoped to an individual signed-in account; organization-wide tenancy is not yet deployed. The current operator must be identified by their actual legal name and address before publication/signature.

## 2. Processing activities
| Activity | Individuals | Data categories | Purpose | Principal recipient/storage | Access and risks | Retention status |
|---|---|---|---|---|---|---|
| Authentication | Account users | Email, user ID, session tokens / auth events | Passwordless sign-in, account access | Supabase Auth | Account-bound; operational logs may contain identifiers | Vendor account/log retention pending |
| Saved roster | Customer employees | Name, home/host region, role, days abroad, payroll setup, visa and social-security certificate status, timestamps | Mobility/compliance screening and record management | Supabase database in project region eu-north-1 as currently configured; verify ancillary transfers | Owner-scoped RLS; one login per roster; not company tenancy | Individual row deletion exists; account-wide retention/deletion not automated |
| Derived screening | Customer employees | Risk levels, model recommendations, policy assumptions and calculations | Internal compliance prioritization and outputs | Browser/app, server projections | Not verified legal conclusions; confirm whether displayed/exported reports are retained by customers | App persistence of derived reports and exports requires confirmation |
| AI prompts/responses | Account users and potentially employees | Relevant screening facts, pseudonymous roster aliases, free-text user questions/history, model responses | Optional Copilot and employee briefs | Gemini API if active; Anthropic only if configured | Combinations and free text may identify employees; vendor terms not verified | Provider retention/training/logging and local cache period pending |
| Early access | Prospect contacts | Work email, company name/size, target countries, submission date | Respond to early-access inquiries | Supabase lead table | Server-only insert/read controls | Lead expiry/marketing removal not implemented |
| Anti-abuse | Site visitors and prospects | Cloudflare challenge metadata; HMAC-hashed IP and email rate-limit identifiers, windows/counts | Bot/spam control and abuse prevention | Cloudflare and Supabase | Hashes remain potentially personal/linkable; avoid logging raw identifiers | Seven-day cleanup planned, not automated |
| Security/support | Users, employees and prospects as applicable | Request metadata, diagnostic messages, privacy requests, incident notes | Troubleshooting, legal obligations and security | Cloudflare, Supabase and operator communication | Avoid personal data in logs and email | Provider-specific retention and internal schedule pending |

## 3. Roles and responsibilities
- Customer supplies employee data and must establish appropriate authority, employee notices and other applicable requirements. Whether 'controller/processor' terminology applies depends on jurisdiction; do not assert it universally.
- Current OrbitalHR operator provides the service, determines account/site-security and lead processing purposes, and must implement safeguards, appropriate third-party arrangements and individual-request response.
- Founder serves as initial Privacy Officer pending incorporation and formal appointment.
- No claim of Canadian-only hosting: Supabase project metadata lists EU North; Cloudflare/AI routing and transfers need assessment.

## 4. Data minimization
Roster fields are constrained, but employee names are saved. AI-facing projection omits saved roster names and IDs from structured prompts, re-labels employees and uses selected screening fields. Questions/history are pattern-filtered only, not completely de-identified. Do not accept passport images or special-category personal records via unsupported fields.

## 5. Unresolved information and approvals
- [ ] Current operator legal identity, business address and actual operating jurisdictions.
- [ ] Client/employee jurisdictions and applicable legal grounds, notices/consents.
- [ ] Vendor contracts, subprocessor locations, AI retention/training, breach assistance.
- [ ] Technical and organizational security controls evidenced.
- [ ] Published privacy notice/contract acceptance and customer DPA.
- [ ] Retention and disposal schedule with tested account/roster deletion process.
- [ ] Support inbox/tracker, rights request and incident drills.
- [ ] Browser/client cache, telemetry and log inventory.

**Maintenance:** Review after new data fields, provider changes, changes in client geography, policy changes, or incorporation. Keep version and decision history.
