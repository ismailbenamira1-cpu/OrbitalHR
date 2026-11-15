# OrbitalHR — MVP Privacy Risk Assessment (DRAFT)
**Date:** 15 November 2026. **Responsible:** Founder/initial Privacy Officer. **Contact:** ismailbenamira1@gmail.com. **Decision:** No authorization for real-employee public launch based solely on this draft.

## 1. System and intended use
Canadian-oriented HR compliance-screening MVP hosted on Cloudflare Pages, with Supabase Auth/rosters and optional Gemini AI, currently per individual user. Personal data includes employee name and job/mobility facts which may reveal sensitive employment or immigration circumstances by inference. Product signals are unverified screening indicators, not legal determinations.

## 2. Risk register
| Risk | Impact | Current evidence / mitigating control | Gap and proposed action | Residual status |
|---|---|---|---|---|
| Cross-account disclosure of employee data | High | Owner-scoped roster RLS, two-user isolation previously smoke-tested | Re-test after any schema/API change; ensure no secret keys in browser | Requires ongoing checks |
| Cross-company access or accidental company-wide deletion | High | Current model is **not** multi-company | Do not market company owner/admin or closure until organization migration + RLS tested | Unmitigated for company features |
| Model provider receives personal data | High | AI roster aliasing and allowlist projection, no saved roster IDs in structured prompts | Free-text can contain other identifiers; verify Gemini API terms, retention/training and cross-border processing; user notice | Open |
| Inaccurate legal/compliance output drives employment decisions | High | Screening-only disclaimers, AI completeness backstops | Qualified corridor review and warnings; prohibit sole automated consequential decisions | Open |
| Excessive retention / inability to close accounts | High | Individual-row deletion in UI; manual request inbox proposed | No tested full-account/company closure, backup deletion schedule, automatic retention; implement practical manual route | Open |
| Unauthorized admin access, compromised API secrets | High | Server-side secrets and authenticated AI endpoints | MFA/access review, incident drill, provider logging, secret rotation and Cloudflare environment checks | Open |
| Data transferred outside Canada without sufficient disclosure | Medium/High | Supabase project region EU North in project metadata | Assess provider logs, edge/AI routing, customer geography, DPA safeguards, lawful notices | Open |
| Spam or mass collection of lead data | Medium | Turnstile, server-only lead insertion, hashed throttling | Purge expired rate-limit counters, alert on failures, manage lead retention | Partially mitigated |
| Unlawful prospect marketing | Medium | Early access requires consent for contact | Separate appropriate CASL basis and unsubscribe for promotional bulk emails | Open |
| Breach response delay | High | Founder designated privacy contact | Implement/try incident runbook and decide notification contacts | Open |
| Misleading legal notices | Medium/High | Drafts clearly marked unpublished, legal pages approval-gated | Finalize current operator and accurately describe current features before release | Open |

## 3. Individual rights and proportionality
Confirm the necessity of names, roles and mobility details for service operations. Restrict unexpected free-text, offer user-side delete and export. Confirm employee/customer notices, correction requests and onward disclosure with each customer. Consider country-specific laws when users/workers are outside Canada and when screening data relates to immigration or other sensitive matters.

## 4. AI and human oversight
Only send task-relevant context; display screening caveats; maintain a practical option to conduct non-AI screening where possible. Human professionals must make binding immigration/tax/employment decisions. Verify provider settings and training commitments—do not infer protections from consumer AI marketing.

## 5. Risk decisions and follow-up
- **Accepted for document drafting and synthetic-data MVP demonstration:** current owner-scoped features may be evaluated with fictional records subject to existing security rules.
- **Not accepted for real customer employee records:** high-impact vendor/retention/legal/incident gaps above must be reviewed and addressed first.
- **Deferred by founder:** organization-tenancy/automated company-level deletion. Defer implementation, not truthful disclosure, manual response responsibilities or proportional safeguards.
- Owner reviews with legal/security advisers as necessary and signs assessment once actual business identity, client scope and provider terms are verified.

## 6. Sign-off
Current legal operator: [TO IDENTIFY]. Reviewer/approval name: [TO IDENTIFY]. Date: [AFTER REVIEW]. Supporting evidence and decisions: [TO ATTACH].
