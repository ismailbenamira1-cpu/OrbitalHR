alter table public.employee_rosters
  add column if not exists visa_authorized_days integer check (visa_authorized_days > 0),
  add column if not exists visa_extension_status text not null default 'Not approved' check (visa_extension_status in ('Not approved','Pending','Approved','Denied')),
  add column if not exists visa_extended_days integer check (visa_extended_days > 0);
