-- Index foreign-key and user-scoped RLS lookup on employee rosters.
create index if not exists employee_rosters_user_id_idx on public.employee_rosters (user_id);
