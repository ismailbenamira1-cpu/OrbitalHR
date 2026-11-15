# OrbitalHR — MVP Service-Provider and International-Processing Register (DRAFT)

**As reviewed:** 15 November 2026. **Owner/contact:** Founder / ismailbenamira1@gmail.com. **This is an inventory, not evidence of signed DPAs or verified storage residency.**

| Supplier | Observed role | Data potentially processed | Region / conditions | Required validation |
| --- | --- | --- | --- | --- |
| Supabase | Auth, user-scoped employee rosters, early-access table and rate-limit counters | Login email/ID, employee roster, leads and hashed counters | Project metadata identifies region **eu-north-1**; verify vendor infrastructure/backup/transfer details | Account DPA, subprocessors, backups, breach notifications, operational retention |
| Cloudflare | Pages site/functions, Turnstile and edge infrastructure | Client IP/request metadata, challenge verification, server requests and operational logs | Geographic processing and log retention not verified | DPA/terms, subprocessors, logging and security configs |
| Google Gemini | Current AI generation | Reduced but potentially identifiable screening context, user questions/history | Provider processing locations, training/retention settings not verified | Confirm exact API/service, applicable agreement, training/data-use terms, deletion and transfer conditions |
| Anthropic (conditional) | Alternative model call if API key enabled | Similar AI context as Gemini | Not verified / may not be active | Confirm whether secret is configured in production before listing as live vendor |

## What the source code establishes
- AI endpoints authenticate the current signed-in user and load owned saved rosters.
- A separate projection replaces saved roster names with Employee 1/2 labels, omits saved database IDs and sends screening inputs needed for model generation.
- Chat questions/history undergo limited filtering, not perfect de-identification. Routing, roles and travel days can remain identifying.
- Early-access registration uses server-side Turnstile verification and privileged database insertion; keyed hashed rate counters are recorded.

## Supplier review questions before real employees
1. Which legal entity supplies each service, under which account plan and contractual terms?
2. What are configured hosting regions, cross-border transfers and subprocessor locations?
3. Does provider use AI request/response data for model training or human review? What retention or abuse monitoring applies to the selected API tier? Do not infer from public consumer Gemini settings.
4. How are access control, confidentiality, security incidents, deletion, backups and support handled?
5. Does any vendor requirement change if workers or customers are outside Canada?
6. Have required notices and agreements been signed/accepted, and recorded with dates and links?

## Important pending actions
- Record actual production provider configuration from authorized Cloudflare settings (do not infer).
- Confirm account-specific Supabase project location, DPA and backup policies.
- Verify provider terms before asserting no-training or zero-retention.
- Attach validated subprocessor schedule to the customer DPA and update public Privacy Notice.
- Define and test retention/deletion periods for each data category separately.

**Do not publish the register as a verified assurance until evidence is collected.**
