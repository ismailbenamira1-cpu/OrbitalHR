# OrbitalHR — Gate 6: MVP operational readiness and release discipline

**Scope decision:** No pre-existing Gate 6 definition was found in the repository. This is the minimal engineering scope chosen for Gate 6, not a retroactive claim of a prior specification.

**Prepared:** 15 November 2026. **Status:** Automated release guardrails implemented; operational readiness and real-data launch authorization NOT established.

## Intended release
An explicitly limited **screening-only MVP** for fictional/test data and restricted demonstrations. Not legally verified advice, work authorization, tax certification, a country-wide official compliance result, or public acceptance of real identifiable employee records. Gate 5 legal/operator/vendor/retention blockers remain independent.

## What was implemented
- Existing GitHub Actions tests: Node test suite, production bundle build, browser smoke, Cloudflare Pages Functions bundling.
- Public deployment audit now probes invalid early-access submissions, foreign-Origin requests, and missing challenge responses, in addition to anonymous/forged AI requests. Tests submit **no valid lead** and use **no employee information or secrets**.
- GitHub Actions [Public deployment audit](../.github/workflows/live-audit.yml) now also has a daily 07:17 UTC best-effort schedule and manual dispatch; schedule may be delayed or disabled by GitHub inactivity. Check run status; configure operator notifications separately. No secret or real employee data is used in these probes.
- Existing earlier controls: per-user RLS on saved rosters, authenticated AI generation, AI structured-data minimization, server-verified Turnstile and lead rate-limiting.
- Staged Privacy and Terms pages remain unpublished and must not be linked as operative policies.

## Engineering acceptance (pass by CI, not manual marketing claim)
- [ ] `npm test` success at exact release commit.
- [ ] `npm run build` success at release commit.
- [ ] Cloudflare Pages Functions build success.
- [ ] Browser smoke success using fictional records.
- [ ] Read-only production audit success **after the production deployment actually matches that commit**.
- [ ] Public AI API rejects anonymous, forged bearer, and cross-Origin calls.
- [ ] Early-access API rejects invalid submissions, cross-origin calls and missing Turnstile challenge without database insert.
- [ ] No unapproved legal pages or organization-level deletion features are presented as live.
- [ ] Review source and build outputs for accidental secrets or developer diagnostics.
- [ ] Confirm no migrations in Gate 6 and no production deletion requests.

## Screening-scope claim audit and final acceptance
- [Screening-scope legal review and launch acceptance report](GATE6_SCREENING_CLAIMS_AND_LAUNCH_ACCEPTANCE.md) documents corrections to unsupported marketing promises, mandatory warnings and scope of the independent legal review still required.
- `tests/gate6-launch-claims.test.js` guards against reintroducing unsupported clearance/verified/automation language and asserts green/OK is not legal clearance.
- Homepage warning is placed above the main dashboard content. Screening matrix is explicitly titled as assumptions; financial figures are illustrative.
- **No legal-accuracy certification:** 42 matrix cells still need specialist review before any claim that their country-specific legal results are verified.
- **Launch decision remains NO-GO for real identifiable employee data** due to Gate 5 approval/deletion/vendor/contract gaps and Gate 6 operator acceptance. A controlled fictional-data beta does not constitute legal validation.

## Operator-only operational acceptance
- [ ] Cloudflare deployment matches intended source commit; verify dashboard status and environment binding.
- [ ] Supabase and Cloudflare admin accounts protected by strong MFA and limited access.
- [ ] Active AI provider, daily and monthly spend caps, alerts and quota behavior reviewed (no unauthorised costly calls in audit).
- [ ] Monitor failed logins, Cloudflare Functions failures, 429/5xx rates, Turnstile rejects and AI provider errors **without logging private prompts/employee records**.
- [ ] Record incident responders and contact at ismailbenamira1@gmail.com, provide backup admin access and rotate compromised credentials.
- [ ] Review provider backups/restores and recovery approach before accepting real data.
- [ ] Run privacy and customer contract sign-off from [Gate 5 completion register](GATE5_DRAFT_COMPLETION_AND_SIGNOFF.md).
- [ ] Validate correctness of high-impact screening routes with qualified advisers before relying on legal claims.

## Release and rollback procedure
1. Record GitHub commit SHA and current successful production deployment ID. Keep customer records unchanged.
2. Confirm `npm test`, production browser build, and audit results against that SHA. Cloudflare public audit can lag while deploy finishes; an audit of an older deployment does **not** certify the newer commit.
3. Manually inspect a fictional account for roster save, editing, CSV and optional Copilot/Employee Brief. Do not paste real employee data into test prompts.
4. Confirm public sign-up protections, limits and contact notice. Never reopen anonymous direct Supabase lead inserts as a workaround.
5. Roll back by selecting the last known-good Cloudflare Pages deployment or reverting the faulty GitHub change and redeploying; verify API/bundle behavior again. Do not assume that rolling back a frontend also reverts database changes. Gate 6 contains no database schema changes.
6. If privacy/security incident suspected: disable affected feature or public access as appropriate, rotate relevant credentials, preserve minimal incident evidence and follow Gate 5 [incident runbook](GATE5_PRIVACY_REQUESTS_AND_INCIDENT_RUNBOOK_DRAFT.md).
7. Note affected deployment version, failure, customer impact (without revealing employee details), fix, test evidence and decision.

## Evidence log template
| Date UTC | Git commit | Production deployment ID | Node tests | Browser smoke | Live audit | Operator approval | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [fill] | [fill] | [fill] | [fill] | [fill] | [fill] | [pending] | [fill] |

## Gate 6 status terms
- **Engineering deliverables complete** after the tests and checks above pass on the current commit.
- **Production operational acceptance pending** until hosting, vendor, spend, alert/incident, rollback, and legal limits are confirmed by the operator.
- **Real-data/public legal release remains blocked** by Gate 5, regardless of Gate 6 engineering results.
