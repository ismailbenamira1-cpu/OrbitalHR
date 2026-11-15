# OrbitalHR — MVP launch gate (15 November 2026)

**Chosen release: public MVP for compliance screening and operational risk alerts only. Public launch is NOT YET APPROVED.** This scope deliberately excludes verified advisory, automated legal determinations and claims of approval for all 42 cells. The matrix can be shown only as clearly unverified screening assumptions, with prominent limits, mandatory adviser review for consequential decisions, and a documented restricted release assessment. Professional review is required before upgrading a specific corridor to verified advice.

## Gate progress update — 15 November 2026

- **Gate 1 (public deployment)**: PASSED, live HTTPS, asset deployment and private AI endpoint rejection checked by GitHub workflow.
- **Gate 2 (private roster)**: PASSED, owner-scoped RLS plus user-confirmed save/edit/delete, refresh/sign-in persistence, and two-account browser isolation.
- **Gate 3 (AI operational smoke)**: PASSED for MVP functional generation: user-confirmed Copilot and Employee Brief both generate useful responses using verified Gemini 3.5 Flash-Lite. Not a legal-accuracy signoff. Provider spending caps, commercial terms, privacy and incident response remain unresolved launch tasks.
- **Gate 4 (lead abuse)**: PASSED for the tested protected registration pathway (15 November 2026). Production Turnstile server verification, server-only Supabase insertion after revoking anon/authenticated direct INSERT, and atomic hashed IP/email rate-limit counters were verified. Synthetic transaction tests confirmed 10/hour per IP and 3/day per email rejection; automated endpoint test confirms HTTP 429 and no insert after limit. Live production 429 exhaustion was not performed. Operational housekeeping remains: automatic purge of counters older than 7 days, ongoing monitoring and incident response.

### Gate 4 operational cutover (must be completed by Cloudflare project operator)

1. Create a production Turnstile widget restricted to orbitalhr.pages.dev, copy its **public site key** into build variable `VITE_TURNSTILE_SITE_KEY`. In Cloudflare Pages Functions store `TURNSTILE_SECRET` as a secret and set `TURNSTILE_EXPECTED_HOSTNAME=orbitalhr.pages.dev`.
2. Set `SUPABASE_URL` and **server-only** `SUPABASE_SECRET_KEY` (Supabase `sb_secret_` secret API key) in Cloudflare Functions, NOT any `VITE_*` variable. Legacy `SUPABASE_SERVICE_ROLE_KEY` is allowed by the endpoint but not preferred. Restrict secret access and rotate as needed.
3. Redeploy frontend and Functions, verify the challenge appears on the registration form. Use a fictional company/email account to submit through `/api/early-access` and confirm exactly one row was inserted. Confirm expired/invalid tokens fail. Challenge is intentionally single-use.
4. **Only after #3 passes** run `docs/GATE4_LEADS_CUTOVER.sql` in the connected Supabase SQL editor. This revokes all direct anonymous/authenticated INSERT access. Verify anonymous direct REST INSERT is rejected and legitimate Turnstile submission still works. Do not run in advance.
5. **Pages-subdomain rate limiting** (no custom domain): install `docs/GATE4_RATE_LIMIT_SETUP.sql` in Supabase SQL Editor. Verify `anon` and `authenticated` cannot call `consume_lead_rate_limit`, while `service_role` can. The code in `functions/api/early-access.js` is already staged: it applies HMAC-hashed, atomic per-source-IP 10/hour and per-email 3/UTC-day caps after Turnstile, before privileged insertion. In Cloudflare Pages Production add `LEAD_RATE_LIMIT_ENABLED=true` (variable, not secret), redeploy, and test one fictional registration with a fresh email. Database RPC outages must reject registration (503); exhausted quotas return 429; ordinary success returns 201. Before this variable is enabled, limits remain INACTIVE. Maintain `lead_rate_counters` by deleting counters older than 7 days in a scheduled maintenance process; do not log source IP/email. Do not enable before SQL installation.
6. Optionally attach a custom Cloudflare-proxied domain later to use zone-level WAF rate-limiting rules; the app-level limiter above functions on `orbitalhr.pages.dev`.
7. Confirm there is no bypass from another public insert policy, and document rollback: temporarily disable public sign-up or restore a privileged backend path, **not** anonymous direct INSERT.

## Gate 5 MVP privacy/legal drafting — documentation complete; launch safeguards outstanding

- **Documentation drafted:** [Gate 5 MVP documentation index](GATE5_MVP_DOCUMENTATION_INDEX.md), linking Privacy Notice, customer DPA, Terms of Service, Acceptable Use/AI Notice, privacy requests and incident response procedure, vendor/subprocessor inventory, and early-access/CASL contact notice.
- **Founder Privacy Officer contact:** ismailbenamira1@gmail.com. **Operator legal name/address and Ontario business registration are still to be verified.**
- **Deferred engineering (founder decision):** company/organization tenancy, account-wide verified closure and automatic 30-day active-database employee deletion. Drafts explicitly say these are **not implemented**. Phase A organization migration is stored in GitHub only and has **not** been executed against production. Existing owner-scoped user rosters are unchanged.
- **Existing implemented product measures:** owner-scoped Supabase roster permissions, authenticated AI endpoints, minimization of structured model inputs, lead Turnstile/rate protection. User previously confirmed Copilot and Employee Brief functional after the AI change.
- **Outstanding before identifiable employee onboarding:** verify legal operator, obtain any required business/customer agreement/consent, publish approved accurate Privacy Notice and Terms, arrange pragmatic verified data deletion/retention response, test breach procedure, validate Supabase/Cloudflare/AI provider data processing and transfers, and complete scoped legal/security review. **Drafting ≠ operational compliance.**
- **Gate 5 all required current-MVP drafts:** COMPLETE. See [Gate 5 documentation index](GATE5_MVP_DOCUMENTATION_INDEX.md) and [approval/sign-off register](GATE5_DRAFT_COMPLETION_AND_SIGNOFF.md). Additional completed drafts: processing record, interim erasure SOP, privacy risk assessment, security/onboarding schedule and employee privacy notice template.
- **Gate 5 status:** DOCUMENTATION COMPLETE; LEGAL/OPERATIONAL GATE OPEN. No policy is published or executed merely by creating these drafts. Gate 6 planning can proceed without interpreting Gate 5 as a real-customer launch authorization. Public launch approval remains withheld pending checklist requirements.

- **Legal website pages staged, not published:** [Gate 5 website staging guide](GATE5_WEBSITE_LEGAL_PAGE_STAGING.md). The live footer indicates Privacy/Terms are in preparation and provides the privacy email. Public policy routes, final review and acceptance flow are not active.

## Gate 6 — MVP engineering and operational readiness (15 November 2026)

- No prior Gate 6 definition existed in the repository. [Gate 6 operational readiness and release/rollback runbook](GATE6_MVP_OPERATIONAL_READINESS.md) defines the limited scope, test evidence, owner-only checks and blocked launch claims.
- Code change: read-only public deployment audit now tests invalid early-access requests, cross-origin requests, and missing Turnstile challenges in addition to existing AI authentication checks; it sends no valid leads, bearer credentials or employee data.
- Scope: no production data migration, customer deletion, public legal-page activation or change in organization tenancy.
- **Gate 6 technical deliverables:** staged; CI/build/browser/live audit status must be checked on the final commit and matched to actual deployed version.
- **Gate 6 operational approval:** pending hosting administration, monitoring/alerts, incident drills, provider cost controls and confirmed rollback. This does not supersede incomplete Gate 5 legal/privacy prerequisites for real employee data.

## Gate 6 — Additional screening-scope legal review and launch acceptance

- [Detailed Gate 6 screening claims and launch acceptance report](GATE6_SCREENING_CLAIMS_AND_LAUNCH_ACCEPTANCE.md).
- The landing-page claims previously promised verified rules, exact payroll migration timing, compliance assurance, and certificate/form automation not present in the MVP. These claims have been replaced with screening-only, source-review-required descriptions.
- The hero now displays prominent legal/work-permission and tax/social-security non-clearance warnings. The employee-entry form advises **fictional records only pending privacy approval**.
- Green/OK track outputs no longer assert legal clearance. 42 matrix cells retain unverified assumptions and require specialist source/route review; a UK visitor-remote-work rule was spot-checked against official guidance but this is not blanket certification.
- Automated [launch claims tests](../tests/gate6-launch-claims.test.js) check that unsupported product promises do not recur.
- **Gate 6 screening-scope documentation and claim edits completed; current final-commit CI, live deployment correlation, professional legal and Gate 5 approvals remain open.**
- **Public onboarding of identifiable employee data: NO-GO.** A demo using fictional records may be tested with the technical smoke-check conditions.

## Engineering controls implemented

- Production Vite build, Playwright smoke test, 37 Node regression tests, and Cloudflare Functions build run in GitHub Actions (consult latest run before claiming green).
- Supabase migrations `visa_stay_tracking` and `launch_security` applied. Employee roster owner-only RLS policies retained. Lead SELECT access revoked for anonymous and ordinary authenticated users.
- AI requests: authenticate with Supabase Auth /user; consume a per-user 20-per-UTC-day quota; load roster under the signed-in user's JWT/RLS; reject missing/out-of-scope saved employees. Client-supplied compliance objects are ignored.
- Public visitor AI calls are disabled. The frontend obtains the session token for AI requests. Guest demo employee records are not persisted.

## Launch-blocking tasks requiring deployment access or business sign-off

1. **Cloudflare Pages configuration and deployment**: verify the production project is building the latest GitHub commit, including `functions/api/*`, and that the live Pages Functions receive `SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable/anon only) and one provider secret `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`. Do **not** set `SUPABASE_SERVICE_ROLE_KEY` in browser-visible `VITE_*` variables. Set supported provider model names and monthly spending caps. Test endpoint: 401 without bearer, 403 with foreign Origin, 200 with the signed-in user, 429 after 20/day; both AI endpoints must fail closed when keys are missing.
2. **Live two-account isolation test**: sign in as two distinct test users in a production-like environment. Each creates, edits and deletes its own test employee and confirms the other user's data is inaccessible. Refresh and sign out, confirm private roster disappears. Confirm magic-link redirects, session expiry, database read/write errors and isolation after refresh. Do not test using real employees.
3. **Live AI provider test**: confirm two authenticated saved-user requests produce distinct PE and individual tax tracks, no invented visas or certificates, and that sensitive data is transmitted only to the intended provider under signed data-processing terms. Verify error states, budget limits, rate limits and logging redaction.
4. **Lead collection abuse prevention**: public direct Supabase insert is still available to anonymous visitors; enable Cloudflare WAF/rate limiting and a verified human challenge (e.g. Turnstile, with server-side verification). Test spam controls without creating customer data.
5. **Privacy/terms/identity**: publish a reviewed privacy notice identifying the legal data controller, contact route, lawful basis, retention periods, international transfer terms, data access/deletion procedure, AI-provider disclosure, and applicable agreements. Implement documented deletion/retention for lead and employee data. Confirm DPA/subprocessor obligations with Supabase and the AI provider. The app's contact-consent checkbox does not substitute for those documents.
6. **Legal review**: have qualified immigration, corporate tax, individual tax and social-security advisers approve sources, scope, role assumptions, stay permissions and policy/legal distinction for every home/host cell. Identify date/citizenship/visa route, tax years, prior stay days, treaty articles and local work rights. Do not treat high-confidence badges as legal approval.
7. **Ops security and reliability**: monitor Cloudflare/Supabase/AI logs and failure rates, establish incident response, backup/restore drill, access and secrets rotation, data retention, WAF bot protection, cross-origin rules, uptime alerts, cost caps and rollback procedure. The Supabase security adviser currently flags a tightly scoped public-schema SECURITY DEFINER quota function and leaked-password protection settings: review and document both before launch.
8. **Product communication**: label model outputs as screening alerts, never 'legal BREACH' findings. Ensure the EOR/local-entity ROI numbers are estimates. Provide terms, support channel and claim limitations.

## Authority-backed spot checks (not a complete 42-cell legal sign-off)

| Rule | Source | Scope and caution |
| --- | --- | --- |
| Thailand visa exemption 30 days since 15 Sep 2026 | https://washingtondc.thaiembassy.org/en/page/visaexempt-voajul2024?form=MG0AV3 | Tourism only; extension discretionary; not work permission |
| UK visitors' overseas remote activities | https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-permitted-activities | Remote work must not be primary purpose of visitor trip |
| UK statutory residence test | https://www.gov.uk/government/publications/rdr3-statutory-residence-test-srt/guidance-note-for-statutory-residence-test-srt-rdr3 | Annual tax-year accounting and ties; 183 days not only test |
| US totalization agreements | https://www.ssa.gov/international/status.html | Verify bilateral coverage by exact host country |
| Canadian agreements | https://www.canada.ca/en/services/benefits/publicpensions/international/agreements.html | Verify agreements, forms and detachment limits by country |
| Philippines 9A visitor extension | https://immigration.gov.ph/visas/visa-waiver/ | Visitor status and work rights are different; extensions beyond 59 days exist |
| Schengen regional short-stay rule | https://home-affairs.ec.europa.eu/policies/schengen/schengen-area/visa-policy_en | Requires dated entry/exit travel history; 'Schengen Area' is not a single tax or SS jurisdiction |

**Not fully verified:** Mexico/India/Indonesia immigration routes, country-specific Schengen criteria, all domestic tax-residency tests and corporate PE treaty/service-PE rules, employer payroll costs, and all treaty certificate duration claims.

## Suggested safe release model

Private, invitation-only beta for synthetic/test data and manual adviser review of every case. Do not enable public automated compliance recommendations until the blockers above are signed off by the responsible technical, privacy and legal owners.

## Launch scope decision — screening MVP

**In scope:** employee roster tracking; reminders and risk-alert prioritisation; recorded stay and extension data; separate employer PE and individual tax indicators; source-confidence labels; internal screening CSV; conditional estimated EOR/payroll feasibility; AI summarisation of the user's own saved roster with explicit uncertainty.

**Out of scope:** declaring a statutory breach, approving work authorisation, making tax residency determinations, certifying social-security coverage, issuing treaty forms, representing the entire matrix as legally verified, making payroll migration decisions automatically, or giving binding immigration/tax/employment advice.

**Acceptance for public screening MVP:** pass production and endpoint integration, RLS isolation, AI/provider/budget tests, abuse prevention, published privacy & terms and deletion policy, support and incident controls, transparent consent and limitations, and targeted legal review of the narrowed marketing claims and safety warnings. Full professional certification of every matrix cell is **not** a blocker for a clearly restricted screening product, but unreviewed claims must remain qualified and must not be shown as definitive legal conclusions.
