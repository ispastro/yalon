-- ============================================================
-- YALON PROFESSIONAL STAFFING SOLUTIONS — DATABASE SCHEMA
-- Postgres / Supabase
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type staff_position as enum (
  'waiter_waitress',
  'bartender',
  'chef',
  'cook',
  'kitchen_assistant',
  'steward',
  'cashier',
  'barista',
  'cleaner',
  'event_support_staff',
  'supervisor',
  'other'
);

create type service_type as enum (
  'hospitality_staffing',
  'event_staffing'
);

create type payment_method as enum (
  'bank_transfer',
  'telebirr',
  'cbe_birr',
  'cash',
  'other'
);

create type shift_preference as enum (
  'morning',
  'afternoon',
  'evening',
  'night'
);

create type application_status as enum (
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'on_hold'
);

create type request_status as enum (
  'submitted',
  'quoted',
  'advance_paid',
  'confirmed',
  'completed',
  'cancelled'
);

create type document_type as enum (
  'passport_photo',
  'cv_resume',
  'national_id_passport',
  'educational_certificate',
  'experience_certificate'
);

-- ============================================================
-- TABLE: customer_requests
-- (Form: Customer Online Service Registration Form)
-- ============================================================

create table customer_requests (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Section 1: Customer Information
  company_name            text not null,
  contact_person          text not null,
  job_title               text,
  phone_number            text not null,
  whatsapp_number         text,
  email                   text not null,
  company_address         text,
  city                    text,

  -- Section 2: Service Required
  service_types           service_type[] not null default '{}',
  positions_requested     staff_position[] not null default '{}',
  other_position_note     text,

  -- Section 3: Event/Service Details
  event_name              text,
  event_date              date,
  start_time              time,
  end_time                time,
  event_venue             text,
  number_of_guests        integer check (number_of_guests >= 0),
  total_staff_required    integer check (total_staff_required >= 0),

  -- Section 4: Staff Requirements (per-role counts)
  -- e.g. { "waiter_waitress": 4, "bartender": 2, "chef": 1 }
  staff_breakdown         jsonb not null default '{}',

  -- Section 5: Additional Information
  requirements_description text,
  special_instructions     text,
  additional_comments      text,

  -- Section 6: Payment
  preferred_payment_method payment_method,
  other_payment_note       text,

  -- Section 8: Terms & Conditions consent
  confirmed_accurate_info      boolean not null default false,
  understood_non_binding       boolean not null default false,
  agreed_advance_payment       boolean not null default false,
  agreed_balance_payment       boolean not null default false,
  agreed_terms_conditions      boolean not null default false,

  -- Workflow tracking
  status                  request_status not null default 'submitted',
  quoted_amount           numeric(12,2),
  advance_amount_paid     numeric(12,2),

  constraint customer_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

create index idx_customer_requests_status on customer_requests(status);
create index idx_customer_requests_event_date on customer_requests(event_date);
create index idx_customer_requests_created_at on customer_requests(created_at desc);

-- ============================================================
-- TABLE: employee_applications
-- (Form: Casual Employee Online Registration Form)
-- ============================================================

create table employee_applications (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- Personal Information
  full_name               text not null,
  gender                  text,
  date_of_birth           date not null,
  nationality              text,
  phone_number             text not null,
  whatsapp_number          text,
  email                    text not null,
  residential_address      text,
  city                     text,

  -- Emergency Contact
  emergency_contact_name         text not null,
  emergency_contact_relationship text,
  emergency_contact_phone        text not null,

  -- Position Applying For
  position_applied         staff_position not null,
  other_position_note      text,

  -- Education
  highest_education_level  text,
  school_or_college        text,
  qualification             text,

  -- Work Experience
  has_hospitality_experience boolean not null default false,
  previous_company         text,
  previous_position        text,
  years_of_experience      numeric(4,1) check (years_of_experience >= 0),

  -- Availability
  available_days           text[] not null default '{}', -- e.g. {monday,wednesday,friday}
  preferred_shift           shift_preference,

  -- Skills
  skills                    text[] not null default '{}',
  other_skill_note          text,

  -- Medical Information
  medically_fit_to_work     boolean not null default true,
  medical_explanation       text,

  -- Declaration
  certified_information_accurate boolean not null default false,
  applicant_signature_name  text,
  declaration_date          date,

  -- Workflow tracking
  status                    application_status not null default 'submitted',
  reviewer_notes            text,

  constraint employee_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint medical_explanation_required check (
    medically_fit_to_work = true or (medically_fit_to_work = false and medical_explanation is not null)
  )
);

create index idx_employee_applications_status on employee_applications(status);
create index idx_employee_applications_position on employee_applications(position_applied);
create index idx_employee_applications_created_at on employee_applications(created_at desc);

-- ============================================================
-- TABLE: employee_documents
-- (Uploaded files linked to an employee application — stored in
--  Supabase Storage; this table stores references, not the files)
-- ============================================================

create table employee_documents (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  application_id        uuid not null references employee_applications(id) on delete cascade,
  document_type         document_type not null,
  storage_bucket        text not null default 'employee-documents',
  storage_path          text not null,   -- e.g. employees/{application_id}/national_id.pdf
  original_filename     text,
  mime_type              text,
  file_size_bytes        integer,

  unique (application_id, document_type)
);

create index idx_employee_documents_application_id on employee_documents(application_id);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customer_requests_updated_at
  before update on customer_requests
  for each row execute function set_updated_at();

create trigger trg_employee_applications_updated_at
  before update on employee_applications
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table customer_requests enable row level security;
alter table employee_applications enable row level security;
alter table employee_documents enable row level security;

-- Public (anon) users can INSERT only — they submit a form, they don't read others' data.
create policy "public can submit customer requests"
  on customer_requests
  for insert
  to anon
  with check (true);

create policy "public can submit employee applications"
  on employee_applications
  for insert
  to anon
  with check (true);

create policy "public can insert their own uploaded documents"
  on employee_documents
  for insert
  to anon
  with check (true);

-- No anon SELECT/UPDATE/DELETE policies are defined for any table,
-- which means anonymous users have NO read access by default under RLS.
-- Only the 'service_role' key (used server-side in Express, never
-- exposed to the browser) or an authenticated 'staff' role can read.

-- Authenticated Yalon staff (admin) can read/manage everything.
-- Assumes staff accounts are tagged with raw_user_meta_data->>'role' = 'staff'
-- via Supabase Auth, or you can swap this for a dedicated `staff_users` table.

create policy "staff can read customer requests"
  on customer_requests
  for select
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'staff'
  );

create policy "staff can update customer requests"
  on customer_requests
  for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff');

create policy "staff can read employee applications"
  on employee_applications
  for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff');

create policy "staff can update employee applications"
  on employee_applications
  for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff');

create policy "staff can read employee documents"
  on employee_documents
  for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff');

-- ============================================================
-- STORAGE BUCKET (run separately in Supabase Storage settings,
-- or via SQL if using the storage schema directly)
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('employee-documents', 'employee-documents', false);
--
-- IMPORTANT: keep this bucket PRIVATE (public = false).
-- Access should only happen via signed URLs generated server-side
-- (using the service_role key in Express), never via public URLs,
-- since these files include national ID photos and medical info.
