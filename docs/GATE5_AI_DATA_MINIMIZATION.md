# Gate 5 — AI data-minimization controls (15 November 2026)

**Status: code staged and CI-tested; production retest and vendor/legal review pending.** Do not accept real employee data until the remaining privacy and contractual gates are satisfied.

## Data processing decision
Customers may retain identifiable employee records in owner-scoped Supabase rosters. When calling external AI generation for OrbitalCopilot and Employee Brief, the backend prepares a restricted field allowlist and replaces stored employee names with sequential labels (Employee 1, Employee 2, …). Database row UUIDs, Supabase auth IDs, and other database metadata do not enter the model payload. The server restores the names to AI output for display to the authenticated user after generation. Deterministic local fallback responses may use saved names without passing them to AI.

AI-visible fields are limited to recorded home/host route, role, days, payroll setup, four-pillar screening tracks, action recommendations, social security certificate fields, and payroll feasibility indicators. User-entered question and short chat history are screened to replace names matching the saved roster and obvious email, phone, and labeled identifier strings.

## Limitations that must be disclosed
- This is **pseudonymization, not anonymization**: combinations of role, destination and travel details may still identify an employee, especially in small teams.
- The free-form Copilot question and history can contain names that are not in the saved roster, uncommon identifier formats, or sensitive narrative details that a pattern filter may miss. Do not claim that all personal information is removed.
- Detailed compliance facts, route, stay durations, and professional characteristics remain shared with the configured external AI provider; users must be accurately informed.
- Restored names appear in user-visible output; care is required when exporting, sharing or caching AI responses.
- The provider selection uses Gemini when its key is configured and Anthropic if that key takes precedence. Verify actual live provider, contracts, data retention, training use, geographic processing and subprocessors before customer use.
- Strongly consider an explicit user notice at point of AI use, a customer DPA, processing register, privacy impact assessment, vendor contractual safeguards, retention/deletion automation, and an AI opt-out or local-only mode prior to real customer records.

## Implementation
- `functions/_shared/ai-privacy.js`: explicit projection, aliases, common identifier redaction, post-generation display-name restoration.
- `functions/api/compliance-assistant.js`: project entire signed-in roster and sanitize selected recent chat history.
- `functions/api/employee-summary.js`: send only one pseudonymized employee and redacted screening reference.
- `tests/ai.test.js`: asserts third-party request contains no stored name, saved database UUID or test email/phone, and response still has the display name.
- No new Cloudflare secret or Supabase migration is required by this code change.

## Next acceptance
1. Confirm CI regression/build/Cloudflare bundle succeeds.
2. Confirm the deployed Production commit includes the new server functions.
3. With synthetic data only, run OrbitalCopilot on a full roster and Employee Brief for a single employee; verify named output, complete screening coverage and no failures.
4. Confirm request payload capture in a controlled test excludes identifiers; do not log real employee data in production.
5. Finish and review Privacy Notice, Terms, DPA, retention/deletion, incident plan, AI subprocessor and data transfer clauses before handling real employee data.
