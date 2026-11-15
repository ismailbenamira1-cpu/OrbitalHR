-- Gate 4 cutover: apply ONLY AFTER:
-- 1) Cloudflare Functions TURNSTILE_SECRET, SUPABASE_SECRET_KEY (backend only),
--    SUPABASE_URL and TURNSTILE_EXPECTED_HOSTNAME have been configured;
-- 2) VITE_TURNSTILE_SITE_KEY has been configured and deployed;
-- 3) an end-to-end synthetic submission through /api/early-access returned HTTP 201.
-- Applying early disables the existing public direct-Supabase early-access form.
begin;
  drop policy if exists "Public can submit early access leads" on public.early_access_leads;
  revoke insert on table public.early_access_leads from anon, authenticated;
  -- Remove any other accidental insert policies for anonymous/product users before launch.
commit;
-- Verify with:
-- SELECT grantee,privilege_type FROM information_schema.role_table_grants
-- WHERE table_schema='public' AND table_name='early_access_leads'
--   AND grantee IN ('anon','authenticated');
-- SELECT policyname,cmd,roles FROM pg_policies
-- WHERE schemaname='public' AND tablename='early_access_leads';
