# OrbitalHR — Interim MVP Retention, Deletion and Verified Request SOP (DRAFT)
**Status:** Proposed manual process pending validation, not a deployed account-closure feature. **Owner:** Founder, Privacy Officer. **Contact:** ismailbenamira1@gmail.com.

## Principle
Collect only necessary information, keep it no longer than reasonably required for the stated business purpose, and provide a workable means to address verified access, correction, and deletion inquiries. A plan to incorporate later does not defer current privacy duties. This is a proposed interim procedure, not a promise that all deletion has been implemented.

## Data schedule — proposed, subject to vendor evidence and legal review
| Category | Proposed active handling rule | Deletion trigger / operational limitations |
|---|---|---|
| Individual employee roster | Retain while needed for authorized account screening; allow signed-in deletion of individual records | Individual-row deletion exists. On verified account/organization closure, manually determine scope and lawfulness before privileged deletion; no company-wide feature exists |
| Company closure | Founder selected future maximum **30 calendar days after verified company closure** for organization employee records in active DB | **Not implementable as a company-level guarantee in present per-user schema.** Do not advertise it until migrated and tested |
| Supabase Auth account | Retain while needed to provide signed-in service | Requests reviewed manually; deleting an Auth user currently cascades their roster rows, which is unsafe as substitute for a future multiuser company closure |
| Early-access prospects | Retain until inquiry resolved or an appropriately documented ongoing purpose exists | Review regularly and delete records no longer needed; no automated expiry currently configured. No invented default number of days |
| Rate-limit counters | Proposed purge of rows with windows older than 7 days | Purge job not configured; audit before claiming automatic cleanup |
| Privacy-request and incident records | Retain minimal details necessary to satisfy applicable laws and demonstrate response | Exact period to be approved per applicable legal obligations and incident severity |
| Provider logs, backups and AI traces | Vendor-specific | Confirm contract/configuration and backup expiry; active-row deletion does not ensure instant removal from backup copies |

## Manual request process (before advanced automation)
1. Receive requests via ismailbenamira1@gmail.com and record only minimum necessary case metadata in a restricted tracker; do not attach roster dumps to ordinary email.
2. Verify the requesting account holder and customer authority using a recent authenticated session or other secure channel. For an employee request, identify the relevant customer and coordinate without exposing their data to the wrong party.
3. Identify scope: one employee row, all rows held by an individual's login, lead entry, authentication data, or future entire organization. **Do not infer company ownership from an email domain or a user's assertion alone.**
4. Check need for correction, return/export, required records and any narrowly justified preservation. Escalate conflicts to appropriate counsel.
5. For individual rows, direct the authorized user to the existing in-app delete and verify disappearance; distinguish saved rows from locally exported CSVs.
6. For whole-account request, develop and test a documented account-specific deletion procedure with a synthetic account **before using any admin deletion against real accounts**. Require a second verification and retain minimal receipt; explicitly explain current inability to self-close.
7. Never run broad `DELETE FROM auth.users`, never remove another user's rows, and never confuse logout with deletion. Record exactly what data and systems were covered and what vendor/backup copies may remain.
8. Notify requester of outcome/limitations in a timely manner under applicable law; provide escalation and correction channels.
9. Maintain a periodic review of old leads, abuse counters, provider retention and outstanding deletion requests; assign a named operator and recurrence only after operational capacity is verified.

## Technical debt deferred, not contractually promised
- Organization-level accounts, verified owner-closure UI and approval; immediate tenancy access lockout.
- Monitored deletion worker, retries and audit ledger; 30-day active-database deletion guarantee.
- Full supplier backup, trace and security log expiration map.
- Automated lead/counter cleanup.

## Preconditions to use with real identifiable employee records
A tested manual procedure for reasonably foreseeable deletion and access requests, provider/security review and legally accurate customer disclosures are needed; **this draft alone is insufficient**. Align the final public privacy notice and DPA with what is actually operational.
