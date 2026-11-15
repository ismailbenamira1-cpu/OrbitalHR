# OrbitalHR — Early Access and Marketing Contact Notice (DRAFT)

**Public form microcopy, to review and place next to the submit control:**

“By submitting this form, you ask OrbitalHR to contact you about your early-access request using the work email address and business details you provide. We will use your information to respond about the product and your request, as described in our [Privacy Notice link]. You can ask us to stop contacting you at ismailbenamira1@gmail.com. OrbitalHR's present operator is [CURRENT LEGAL OPERATOR NAME], not an incorporated Canadian company.”

**Separate optional marketing opt-in (if marketing campaigns will be sent):**

[ ] “I also agree to receive promotional product updates from OrbitalHR by email. I understand I can unsubscribe at any time.”

Do not pre-check the marketing opt-in. Do not imply that agreeing to an early-access reply automatically gives unlimited permission for unrelated newsletters or promotions.

## CASL operating guidance for review
- Commercial electronic messages generally require consent or a valid exemption, appropriate identification/contact details, and a working unsubscribe mechanism.
- Record permission to contact, source, wording/version, timing and unsubscribe history in an access-controlled system if relied on for commercial email.
- Configure a working unsubscribe address/link and process opt-outs as legally required. This is **not yet proven implemented**.
- Actual operator identification, mailing contact information and message template requirements must be confirmed before large-scale outreach.
- A genuine direct reply to a submitted inquiry may receive different legal treatment from an unsolicited marketing campaign; assess the exact message and circumstances.
- Do not automatically send promotional campaigns using all `early_access_leads` records merely because form submission includes a contact checkbox.
- The current database stores lead details and creation time, but a separately versioned marketing-consent ledger is not established; the current consent is a prerequisite to contacting the lead about their request, not proof of broad marketing consent.

**Before deploying microcopy:** insert functioning reviewed links, verify actual consent representation against production UI, decide if separate marketing opt-in is required for intended outreach, and make supporting schema/API changes only when authorized.
