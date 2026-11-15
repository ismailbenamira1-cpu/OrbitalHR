-- Gate 5M STAGING VERIFICATION ONLY.
-- Run in a disposable Supabase TEST project after applying Phase A there.
-- This script reads catalog state. It does not create, update or delete user data.
-- It CANNOT replace integration tests with actual invited users and HTTP RLS checks.
BEGIN READ ONLY;

DO $$
DECLARE
  t text;
  has_rls boolean;
  old_policies int;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'public.organizations',
    'public.organization_memberships',
    'orbital_internal.organization_closure_requests'
  ] LOOP
    SELECT c.relrowsecurity INTO has_rls FROM pg_class c WHERE c.oid=to_regclass(t);
    IF has_rls IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'RLS not enabled: %',t;
    END IF;
    IF has_table_privilege('anon',t,'SELECT') OR
       has_table_privilege('anon',t,'INSERT') OR
       has_table_privilege('authenticated',t,'SELECT') OR
       has_table_privilege('authenticated',t,'INSERT') OR
       has_table_privilege('authenticated',t,'UPDATE') OR
       has_table_privilege('authenticated',t,'DELETE') THEN
      RAISE EXCEPTION 'Browser role unexpectedly has access to %',t;
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='employee_rosters'
      AND column_name='organization_id' AND is_nullable='YES'
  ) THEN
    RAISE EXCEPTION 'Nullable roster organization_id missing';
  END IF;

  SELECT count(*) INTO old_policies FROM pg_policies
  WHERE schemaname='public' AND tablename='employee_rosters'
    AND policyname IN (
      'Users can view their own roster','Users can insert into their own roster',
      'Users can update their own roster','Users can delete from their own roster'
    );
  IF old_policies <> 4 THEN
    RAISE EXCEPTION 'Expected 4 baseline owner-scoped roster RLS policies, found %',old_policies;
  END IF;

  IF NOT has_table_privilege('authenticated','public.employee_rosters','SELECT')
     OR NOT has_table_privilege('authenticated','public.employee_rosters','INSERT')
     OR NOT has_table_privilege('authenticated','public.employee_rosters','UPDATE')
     OR NOT has_table_privilege('authenticated','public.employee_rosters','DELETE') THEN
    RAISE EXCEPTION 'Existing roster CRUD grants changed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('organizations','organization_memberships')
  ) THEN
    RAISE EXCEPTION 'Phase A must not expose new browser-facing policies yet';
  END IF;
  RAISE NOTICE 'Phase A catalog checks passed (not an end-to-end cross-tenant test)';
END $$;

SELECT
  (SELECT count(*) FROM public.employee_rosters) AS roster_rows_after,
  (SELECT count(*) FROM public.organizations) AS staged_organizations,
  (SELECT count(*) FROM public.organization_memberships) AS staged_memberships;
ROLLBACK;
