# OrbitalHR — MVP launch gate (15 November 2026)

**Decision: NOT APPROVED for public customer use.** The application is a screening/demo product, not a jurisdiction-specific legal determination engine. All 42 cells must be professionally reviewed before marketing them as verified compliance outcomes.

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
