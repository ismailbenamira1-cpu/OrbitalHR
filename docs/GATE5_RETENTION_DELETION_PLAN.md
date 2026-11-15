# OrbitalHR Gate 5 — Employee retention and account-closure implementation plan

**Decision recorded:** 15 November 2026. **Policy:** After verified account closure, remove that account's identifiable employee roster records from the **active database within 30 calendar days**. This decision is a maximum period, not an obligation to retain data for the full 30 days.

**Status: APPROVED POLICY DECISION; NOT YET OPERATIONALLY IMPLEMENTED.** Do not represent OrbitalHR as providing automated 30-day deletion until the entire closure mechanism is deployed and tested.

## Updated scope decision (15 November 2026)
The founder chose **company/organization-level closure**, not the initially proposed login-only closure. The 30-day active-roster deletion maximum is measured from verified *organization closure*. See [GATE5_ORGANIZATION_CLOSURE_ARCHITECTURE.md](GATE5_ORGANIZATION_CLOSURE_ARCHITECTURE.md) for staged schema, authorization, testing and job requirements. Do not implement individual Auth deletion as a surrogate for company closure. Organizational closure remains **not implemented**.

## Verified current implementation
- Authentication is via Supabase Auth, with one user id per login.
- `public.employee_rosters.user_id` references `auth.users.id ON DELETE CASCADE`, so deleting the Auth user immediately deletes matching roster rows, **not** after 30 days.
- RLS grants authenticated users access only to rosters with their own `user_id`.
- The UI permits deleting individual employee records and signing out, but has **no account closure flow** or automated deletion after closure.
- The app has no company/organization model or delegated company administrators. Closing one login is not necessarily the same as closing a customer's organization account.
- As of inspection, the production database has existing user accounts and rosters. **Do not manually delete any auth users or employee rows as part of implementation testing**.

## Proposed customer-facing policy language (DRAFT, NOT PUBLISHED)
“When an authorized account holder completes verified account closure, we will delete their employee roster records from OrbitalHR's active database no later than 30 calendar days after the effective closure date, subject to narrowly defined legal preservation requirements. We will remove access at closure and verify completion. Backup copies and independently retained security records have separate documented expiry periods [TO CONFIRM].”

## Acceptance criteria before real employee-data onboarding
1. **Define closure subject and authorization.** During single-user MVP: an owner closes their own login/roster only; the application must not advertise company-wide closure or allow one user to erase a different customer's data. When organization accounts are introduced, require organization owner verification and rules for co-admins and users.
2. **Account closure mechanism:** a signed-in user requests closure, completes recent re-authentication or other approved verification, is told the irreversible consequences, and receives a non-sensitive receipt with the effective closure timestamp and deletion deadline. Do not take action merely because the user signed out.
3. **Immediate access cutoff:** once closure becomes effective, prevent new sessions and ongoing privileged API/roster actions. Auth deletion invalidates refresh tokens but previously issued JWTs may remain valid until expiry; define short token lifetime or additional server-side revocation check. A pending-closure marker must be enforced on all relevant routes and roster access, not just UI buttons.
4. **Deletion:** use a privileged backend or managed job to delete only the verified subject's data within 30 calendar days; use idempotent processing, retries, alerts for overdue failures and a completion ledger with no raw employee details. Define what happens when prior deletion is already completed.
5. **Recovery/cancellation:** if a grace-period recovery is offered, specify terms, reverify owner and ensure account suspension is secure. Do not promise recovery unless built and tested.
6. **Backups:** confirm Supabase backup availability and realistic retention limits; retained backups are not immediately rewritten by active-database deletes. Document backup expiry and restricted restoration/re-deletion controls.
7. **Other data:** establish separate retention schedules for lead records, account authentication metadata, rate-limit counters, AI provider request history, Cloudflare logs and any legal holds. No deletion guarantees are currently established for these.
8. **Evidence:** tests on newly created synthetic accounts only: authenticated initiation, unauthorized/cross-account rejection, access cutoff, pending deletion record, scheduled deletion, idempotence, failure/retry, and verified absence of active roster data within deadline. Verify the mechanism does not delete unrelated users' data.
9. **Contracts/notices:** align privacy notice, DPA, customer Terms and the support-runbook with the implemented behavior. Do not publish draft policy before vendor/legal review.

## Recommended engineering sequencing
A. Choose whether “account closure” currently means **individual user login** or **customer organization**. Current schema supports only the former.
B. Design a private account-closure request record with verified requester, effective time, deadline, request status and audit timestamp, plus owner-scope protection and no personal record snapshots.
C. Implement access suspension and authenticated closure API, then tested privileged deletion job using supported Supabase Auth administration APIs, plus alerts.
D. Add UI and controlled synthetic integration tests; verify end-to-end before enabling for real customers.
E. Separately schedule deletion of expired hashed anti-abuse rate-limit counters older than seven days, with verified job monitoring.

## Safety
- Never restore anonymous `INSERT` to `early_access_leads`.
- Never expose privileged Supabase secret keys to the browser.
- Never schedule roster deletion based on account inactivity or sign-out alone.
- Never run a broad deletion against `auth.users` or `public.employee_rosters` without explicit verified account-specific closure.
- Owner-scoped roster and security controls must remain functional while the migration is designed.
