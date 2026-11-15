# OrbitalHR — Privacy Requests and Security Incident Procedure (MVP DRAFT)

**Owner:** Founder, initial Privacy Officer. **Contact:** ismailbenamira1@gmail.com. **Status:** Draft internal operating procedure; must be rehearsed before real customer employee data is accepted.

## A. Privacy inquiries: access, correction, deletion, complaint
1. Record receipt date, request category, minimal contact details and requested scope in a restricted tracker; do not copy employee rosters into email or the tracker.
2. Acknowledge receipt through the existing contact channel without confirming whether a specific employee is in a customer's system.
3. Verify the requester's identity and authority using minimum necessary evidence. Never request a password or ask for a passport scan by ordinary email. An employee seeking customer-entered roster data may need to be referred to the employing customer; coordinate with the customer and avoid accidental disclosure to a third party.
4. Confirm whether the request concerns the user's Supabase account, an employee roster, early-access lead record, or service-provider records. Confirm if another customer's information may be implicated.
5. Assess applicable law and exceptions; distinguish correction of a record from changing a screening rule. Capture the outcome and any reasons an item cannot be removed immediately.
6. For an authorized saved employee-row deletion, use the existing individual-row deletion flow and verify the row no longer appears. For whole-account/company closure, **there is currently no automatic workflow**: do not say it is complete; manually coordinate a verified request under a reviewed process before making a privileged database change.
7. Respond within legally applicable deadlines [COUNSEL TO CONFIRM BY JURISDICTION]. Keep a minimal record of response and completion. Provide a channel to challenge the outcome.
8. Minimize copies and securely dispose of transient evidence after the reviewed retention period.

## B. Security incident handling
1. **Intake:** classify suspected exposure, unauthorized access, compromised account, public secret, model prompt disclosure, lost data, malicious registration or service outage. Record time discovered, reporting contact and affected systems; avoid storing raw sensitive data in alerts.
2. **Contain:** disable affected API/feature where needed, revoke compromised credentials, rotate cloud secrets, restrict affected services or accounts, and preserve necessary forensic information with access controls. Do not delete evidence indiscriminately.
3. **Assess:** identify what personal information was affected, whether third-party/cloud vendors were involved, affected individuals and jurisdictions, duration, risk of harm, and whether access was confirmed or suspected.
4. **Escalate:** founder acts as Privacy Officer and incident coordinator until a documented replacement is appointed; contact cloud providers and qualified privacy/security advisers as appropriate. Establish backups and a secondary contact before meaningful customer use.
5. **Notification:** decide and document regulatory, customer and individual notification obligations. Where PIPEDA applies, assess the **real risk of significant harm** threshold and required breach records. Do not promise a fixed 24/72-hour response unless law or a signed DPA requires it and a reliable operational capacity exists.
6. **Restore and prevent recurrence:** verify access controls, apply fixes and test. Document root cause, dates and remedial actions.
7. **Closeout:** review lessons learned, access to incident artifacts and retention of incident records under applicable law. Do not claim this draft represents a tested incident program.

## C. Escalation and evidence checklist
- Founder mailbox monitored and verified: [CONFIRM].
- Backup authorized emergency contact: [ASSIGN].
- Supabase, Cloudflare, Gemini and, if enabled, Anthropic support/escalation routes: [VERIFY].
- Restricted privacy request/incident tracker: [CREATE].
- Admin MFA, access review, secret rotation and response drill: [VERIFY].
- Cross-border notification assessment and breach records: [COUNSEL VERIFY].
- Backup and post-restore deletion treatment: [VERIFY].

**Owner review required before adopting this as the operating procedure.**
