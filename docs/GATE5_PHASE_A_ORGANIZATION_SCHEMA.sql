-- Gate 5M PHASE A — STAGED ONLY. DO NOT RUN IN PRODUCTION BEFORE REVIEW.
-- Additive organization tenancy scaffolding; no data backfill, RLS replacement or deletion.
-- The existing employee_rosters.user_id policies remain unchanged.
BEGIN;

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 2 AND 160),
  lifecycle_state text NOT NULL DEFAULT 'active'
    CHECK (lifecycle_state IN ('active','closure_pending','closed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closure_effective_at timestamptz,
  delete_by timestamptz,
  CONSTRAINT org_closure_deadline_guard CHECK (
    (lifecycle_state = 'active' AND closure_effective_at IS NULL AND delete_by IS NULL)
    OR
    (lifecycle_state <> 'active'
      AND closure_effective_at IS NOT NULL
      AND delete_by IS NOT NULL
      AND delete_by <= closure_effective_at + interval '30 days'
      AND delete_by >= closure_effective_at)
  )
);

CREATE TABLE IF NOT EXISTS public.organization_memberships (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','member')),
  membership_state text NOT NULL DEFAULT 'active'
    CHECK (membership_state IN ('active','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id,user_id)
);
CREATE INDEX IF NOT EXISTS organization_memberships_user_idx
  ON public.organization_memberships (user_id,organization_id);

-- Add tenant ID as NULLABLE: all existing employee records remain in the user-scoped system.
ALTER TABLE public.employee_rosters
  ADD COLUMN IF NOT EXISTS organization_id uuid
    REFERENCES public.organizations(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS employee_rosters_organization_idx
  ON public.employee_rosters (organization_id);

-- Preserve existing roster CRUD permissions, but prohibit browser clients from
-- assigning tenant IDs until a verified org-level transition is launched.
CREATE OR REPLACE FUNCTION public.guard_roster_organization_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $fn$
BEGIN
  IF current_user IN ('anon','authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.organization_id IS NOT NULL THEN
        RAISE EXCEPTION 'organization assignment requires an authorized server operation'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'organization reassignment requires an authorized server operation'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.guard_roster_organization_assignment() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS guard_roster_organization_assignment
  ON public.employee_rosters;
CREATE TRIGGER guard_roster_organization_assignment
  BEFORE INSERT OR UPDATE ON public.employee_rosters
  FOR EACH ROW EXECUTE FUNCTION public.guard_roster_organization_assignment();

-- Closure requests are service-only placeholders; no scheduling/deletion is activated.
CREATE SCHEMA IF NOT EXISTS orbital_internal;
REVOKE ALL ON SCHEMA orbital_internal FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA orbital_internal TO service_role;
CREATE TABLE IF NOT EXISTS orbital_internal.organization_closure_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE
    REFERENCES public.organizations(id) ON DELETE RESTRICT,
  verified_requestor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  effective_at timestamptz NOT NULL,
  delete_by timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending','processing','complete','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  completed_at timestamptz,
  failure_code text,
  CHECK (delete_by >= effective_at AND delete_by <= effective_at + interval '30 days')
);
CREATE INDEX IF NOT EXISTS org_closure_requests_due_idx
  ON orbital_internal.organization_closure_requests (state, delete_by);

-- Defense in depth: ALL new tables start inaccessible to browser roles.
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE orbital_internal.organization_closure_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.organizations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.organization_memberships FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE orbital_internal.organization_closure_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.organizations TO service_role;
GRANT ALL ON TABLE public.organization_memberships TO service_role;
GRANT ALL ON TABLE orbital_internal.organization_closure_requests TO service_role;

-- No browser RLS policies on the new tables in Phase A, intentionally.
-- DO NOT alter existing employee_rosters policies or authenticated grants here.
-- DO NOT create orgs or memberships, backfill organization_id, or delete any rows.
COMMIT;
