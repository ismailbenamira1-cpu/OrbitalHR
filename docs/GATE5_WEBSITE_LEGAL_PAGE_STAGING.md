# Gate 5 — Website legal page staging (NOT YET PUBLIC)

**Stage:** Code prepared; publication blocked until legal approval. **Updated:** 15 November 2026.

## Files
- `src/legal/legalDraftContent.js` — verbatim copies of `docs/GATE5_PRIVACY_NOTICE_DRAFT.md` and `docs/GATE5_TERMS_OF_SERVICE_DRAFT.md`.
- `src/legal/LegalPages.jsx` — reusable responsive Privacy/Terms page renderer and footer links.
- `tests/legal-staging.test.js` — confirms content matches source, approval flag remains false and public app entrypoints do not mount draft pages.
- `src/App.jsx` — currently displays only “Privacy Policy and Terms of Service: in preparation” and the working privacy email link; it **does not** link to draft policies.

## Publication rules
1. Current docs have legal-identity, geographic processing, contract, retention and liability placeholders. Do not remove warnings or imply current company incorporation.
2. Legal owner and qualified counsel must validate actual operator, service address, effective date, service provider processing/AI commitments, current retention/deletion capabilities, terms, and legally required employee processing measures.
3. Replace draft source docs with approved final copy, synchronize `legalDraftContent.js` and update/regression-test their equality. Only after explicit approval change `LEGAL_APPROVED` to true.
4. Route `/privacy` and `/terms` to `LegalPage type='privacy'|'terms'` from a reviewed route entrypoint. Mount `StagedLegalFooterLinks` in the footer and remove “in preparation” message. Verify direct URL load / refreshing paths on Cloudflare Pages, back navigation, mobile accessibility, and no broken links.
5. Ensure early-access consent flows actually link to published policy and that customer agreement acceptance is recorded. A website footer alone does not create an enforceable DPA or Terms acceptance.
6. Review site in an incognito browser, and verify the pages are available publicly **only after** the final contents are approved.
7. Do not claim publication is complete based on files in a public GitHub repository.

## Current behavior
- The landing/dashboard continues working unchanged except for a footer indicating documents are in preparation and displaying the monitored privacy contact.
- `/privacy` and `/terms` are **not implemented public policy routes**. The staged component returns a placeholder when approval is false, even if inadvertently mounted.
- Advanced company-account migration, 30-day automated company deletion and backups schedule remain deferred; public policy must describe actual capabilities, not planned guarantees.
