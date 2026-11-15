# OrbitalHR Gate 5 — Organization accounts and company-wide 30-day closure
**Design decision:** company-level accounts, not merely individual user deletion.  
**Status:** architecture/rollout plan; NOT deployed. Existing production access rules and records remain unchanged.

## Confirmed baseline
- `public.employee_rosters` is currently owned by `user_id` linked to `auth.users(id) ON DELETE CASCADE`.
- 5 saved employee rows belonging to 2 login accounts were present at inspection.
- `src/App.jsx` loads and saves the signed-in user's rows, with no organization selector or company-membership model.
- `functions/_shared/roster.js` loads the authorized user's rows under their user JWT. Both AI endpoints depend on this function.
- The owner has selected: remove a **closed company's employee records from the active database within 30 calendar days of verified company closure**.
- Do not equate a person's sign-out, membership removal, or deletion of one login with company closure.

## Target schema (to stage then migrate; no production SQL applied yet)
1. `organizations`: id UUID primary key, display_name, state (active/closure_pending/closed), created_at, closure_requested_at, closure_effective_at, delete_by, deleted_at. Create a separate minimal non-personal administrative tombstone/audit record for deletion results, with a justified retention schedule. Avoid keeping original company name or employee data in that ledger.
2. `organization_memberships`: (organization_id, user_id) unique composite; role `owner|admin|member`, membership status; created_at. Only a verified **owner** may close an organization. Administrators may manage members only subject to explicit permissions. A login can belong to multiple companies.
3. `employee_rosters.organization_id` UUID nullable **during migration** (foreign key organizations.id). Later: not null for all genuinely organization-owned records, after backfill and tests. Maintain old `user_id` audit/creator field but **do not use creator ID as tenancy authorization** after full cutover. Avoid cascading company-owned roster rows from `auth.users` deletion: adjust FK behavior only after company ownership and backfill are correct.
4. `organization_closure_requests` in private schema (or service-only table): company id, verified requesting owner, verified_at, requested_at, effective_at, delete_by, state, attempt count, completed_at, last_failure_code. No employee names or full company personnel snapshots.
5. `organization_closure_audit` minimal receipt: randomized closure request id, company id or HMAC reference, receipt time, date of active-data deletion, method, actor/service, outcome; protect retention and access.

## Authorization rules
- All customer data and AI requests must be scoped to an explicit server-validated organization ID. Do not authorize membership from client-provided role, unverified email domain, `user_metadata`, or a stale JWT membership claim.
- Memberships must have strict RLS, or be accessed through carefully scoped private-schema helper functions with a pinned search_path and restricted EXECUTE privileges. Avoid recursive RLS joins.
- Deny all roster SELECT/INSERT/UPDATE/DELETE when organization status is not `active`. Use active-membership checks for each action and prevent cross-organization reassignment through UPDATE WITH CHECK.
- Service-role secret stays server-only; never return it to the browser. Verify separate-company isolation for owner/admin/member, former members, pending-closure company and unrelated accounts.
- Protect owner addition/removal, membership invitations, transfers and company creation against forged claims. No member may promote themselves to owner.
- When company becomes closure_pending, remove access immediately at DB RLS and AI API; account JWTs may remain valid until expiry, so authorization must depend on current organization state, not just cached session.
- Multiple companies per user must be supported explicitly; closing Company A must not delete the login or data for Company B.

## Closure process
1. Current verified organization owner selects **Close company account** and reauthenticates recently (or equivalent strong verified confirmation), sees record counts, effect on all authorized members, and warning that access is removed.
2. Generate a closure request and immutable server timestamp; set organization state to `closure_pending` in one atomic, idempotent transaction; record a deletion deadline **no later than 30 calendar days after effective closure**. Invalidate company access immediately.
3. Worker/cron with server-only privileges looks up due closure requests, takes an exclusive lock and deletes records strictly scoped by organization ID. Delete associated company-owned objects/storage after verification; avoid deleting a user’s global Supabase Auth account if they belong to any other organization.
4. Record non-sensitive completion evidence and verify zero matching rows remain in active data stores. Retry errors and alert when approaching/overdue the 30-day deadline. Account for backup expiry and verified restoration practices separately.
5. Determine whether cancellation or restoration is allowed during the 30-day period; never silently reopen access. Honor narrowly justified legal holds with documented exceptions and review.

## Safe engineering rollout
**Phase A — additive schema only:** create organizations, membership table, minimal service-only closure requests, and nullable roster organization_id; RLS must be restrictive and policies thoroughly tested. Do not remove existing RLS or backfill by guessing employer names.
**Phase B — organization creation/invitation:** verified owner onboarding, secure membership management and active-org selection in UI.
**Phase C — new tenancy authorization:** update all CRUD/API/CSV/AI paths to filter organization and re-run RLS isolation on two companies with multiple users; then migrate existing rosters with verified ownership mapping and no lost rows.
**Phase D — closure:** implement verified owner request, immediate company-wide access suspension, atomic deadline, deletion job, monitoring, alert and backups policy.
**Phase E — release:** verify synthetic end-to-end tests, access cutoff, user who belongs to 2 organizations, no cross-company data leak, deletion completion, idempotency, failure recovery; amend privacy notice/DPA/Terms and review legally.

## Test cases required
- Member in A cannot read, modify, export or obtain AI summaries for B.
- Owner A cannot close B or grant themselves membership in B.
- Member/admin of A cannot close A absent owner approval.
- Former A member and active member of B lose access to A when A closes, retain B.
- New writes to a closing/closed organization fail even with older JWTs.
- Deletion removes only A's data, leaves B untouched.
- Deleting/revoking a member login does not accidentally erase a multi-user company's records.
- 30-day deletion deadline alerts, retries and backup handling validated.

## Prioritized next step
Do **not** run a destructive migration or add company-wide close button yet. Stage the additive schema in a separate reviewed SQL migration and validate its RLS in a non-production/test project; only then execute the additive phase in production after confirming baseline record counts. The customer-selected 30-day target is a policy requirement, not a currently active feature.

## Relevant Supabase documentation
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/managing-user-data
