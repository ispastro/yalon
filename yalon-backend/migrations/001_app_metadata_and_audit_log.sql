-- ============================================================
-- MIGRATION 001: app_metadata role + audit_log table
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- PART 1: Fix RLS policies to use app_metadata instead of
-- user_metadata. app_metadata is only writable by the
-- service_role key (server-side). user_metadata can be
-- modified by the user themselves via supabase.auth.updateUser()
-- and must NEVER be trusted for access control.
-- ============================================================

-- Customer requests
drop policy if exists "staff can read customer requests" on customer_requests;
drop policy if exists "staff can update customer requests" on customer_requests;

create policy "staff can read customer requests"
  on customer_requests
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'staff'
  );

create policy "staff can update customer requests"
  on customer_requests
  for update
  to authenticated
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');

-- Employee applications
drop policy if exists "staff can read employee applications" on employee_applications;
drop policy if exists "staff can update employee applications" on employee_applications;

create policy "staff can read employee applications"
  on employee_applications
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');

create policy "staff can update employee applications"
  on employee_applications
  for update
  to authenticated
  using  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');

-- Employee documents
drop policy if exists "staff can read employee documents" on employee_documents;

create policy "staff can read employee documents"
  on employee_documents
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');


-- ============================================================
-- PART 2: Audit log table
-- Records every status change made by a staff member so there
-- is a clear, tamper-evident history of who did what and when.
-- ============================================================

create table if not exists audit_log (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  -- Who performed the action
  actor_id       uuid not null references auth.users(id) on delete set null,
  actor_email    text not null,

  -- What record was affected
  table_name     text not null,   -- 'customer_requests' | 'employee_applications'
  record_id      uuid not null,

  -- What changed
  action         text not null,   -- 'status_change' | 'amount_update' | 'notes_update'
  old_value      text,
  new_value      text,
  note           text             -- optional human-readable description
);

create index idx_audit_log_record    on audit_log(table_name, record_id);
create index idx_audit_log_actor     on audit_log(actor_id);
create index idx_audit_log_created   on audit_log(created_at desc);

-- RLS: staff can insert their own log entries and read all entries.
alter table audit_log enable row level security;

create policy "staff can insert audit log"
  on audit_log
  for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'staff'
    and actor_id = auth.uid()
  );

create policy "staff can read audit log"
  on audit_log
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'staff');


-- ============================================================
-- PART 3: How to provision a staff user
-- Run this for each admin account (replace the UUID).
-- This is the ONLY correct way to grant staff access —
-- setting app_metadata via the service_role key.
-- ============================================================

-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"role": "staff"}'::jsonb
-- where email = 'admin@yalon.com';
