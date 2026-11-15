# OrbitalHR — Controlled MVP Deployment Guide

**Current launch status: NOT approved for public compliance use.** Read [MVP launch gate](docs/MVP_LAUNCH_GATE.md) and [42-cell legal register](docs/LEGAL_42_CELL_SIGNOFF.md) first.

OrbitalHR is a screening and operational alert MVP built with React, Vite, Supabase and **Cloudflare Pages Functions**. The included API endpoints are implemented as Cloudflare Pages Functions: deploying only the static Vite bundle to Vercel/Netlify will **not** deploy those endpoints.

## Local development

- Node.js 22 or later.
- Run `npm install`, `npm test`, and `npm run build`.
- To compile the server Functions, run `npx wrangler@4 pages functions build functions --outfile /tmp/orbital-functions.mjs`.
- `npm run dev` provides the frontend only; for local Cloudflare Functions integration use `npx wrangler pages dev dist`.

## Supabase bootstrap — new project only

1. Create a Supabase project and configure email OTP/Magic Link with the actual production domain allowlisted in Auth URL settings.
2. Run the **root `schema.sql`** once in the Supabase SQL Editor. It creates private user-scoped employee rosters and a public **write-only** early-access lead table.
3. Run `supabase/migrations/202611150002_launch_security.sql` in the SQL Editor for the 20-per-day per-user authenticated AI quota. The optional `202611150001_visa_stay_tracking.sql` is idempotent and may be applied to an older database; the updated bootstrap schema already includes those columns.
4. Never put the Supabase `service_role` key in a browser application.

**Existing connected OrbitalHR database:** both `visa_stay_tracking` and `launch_security` migrations have already been applied. Do not rerun the bootstrap there.

## Cloudflare Pages GitHub deployment

1. Create/link a Pages project to this repository, production branch `main`.
2. Build command: `npm run build`; output folder: `dist`. Enable automatic Pages Functions deployment from `functions/`.
3. Configure frontend environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Configure Cloudflare **Pages Functions bindings/environment variables** `SUPABASE_URL` and `SUPABASE_ANON_KEY`, corresponding to the same Supabase project. These values must be available in the worker runtime, not just local `.env` files.
5. Add one server-side AI secret: `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`; optional model overrides `CLAUDE_MODEL`, `GEMINI_MODEL`. Do **not** prefix any AI secret with `VITE_`.
6. Set provider spending caps, Cloudflare abuse/rate limiting (particularly for anonymous lead submissions), allowed Supabase Auth redirect domains, alerts and rollback.
7. Confirm the deployed hash is the tested GitHub commit. Test auth, RLS, both AI Functions, quota-denial and absence of cross-user information leaks using **two synthetic test accounts**, then clean up test data.

## Privacy and compliance gates before public customers

- Publish a vetted privacy notice naming the controller, contact method, retention schedule, subprocessor and transfer disclosures; establish rights handling and agreements.
- Require qualified local legal/tax/immigration/social-security review of **all 42 rules** before claiming legal verification.
- Work permission, treaty residence, payroll and PE liability are not determined by a single day-count input. Output remains screening only.
- Consider a private, invitation-only beta with **synthetic data** before handling real client records.

CI runs Node regression tests, Cloudflare Functions compilation, production Vite build and Chromium browser smoke tests on pushes and PRs. Green CI is required but not sufficient for legal, security or customer data readiness.
