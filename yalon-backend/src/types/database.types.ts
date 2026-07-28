// ============================================================
// YALON — TypeScript types matching schema.sql
// Once the schema is live in Supabase, you can replace this file
// with an auto-generated one via:
//   npx supabase gen types typescript --project-id <your-project-id> > database.types.ts
// This hand-written version is a solid starting point until then.
// ============================================================

export type StaffPosition =
  | 'waiter_waitress'
  | 'bartender'
  | 'chef'
  | 'cook'
  | 'kitchen_assistant'
  | 'steward'
  | 'cashier'
  | 'barista'
  | 'cleaner'
  | 'event_support_staff'
  | 'supervisor'
  | 'other';

export type ServiceType = 'hospitality_staffing' | 'event_staffing';

export type PaymentMethod =
  | 'bank_transfer'
  | 'telebirr'
  | 'cbe_birr'
  | 'cash'
  | 'other';

export type ShiftPreference = 'morning' | 'afternoon' | 'evening' | 'night';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'on_hold';

export type RequestStatus =
  | 'submitted'
  | 'quoted'
  | 'advance_paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type DocumentType =
  | 'passport_photo'
  | 'cv_resume'
  | 'national_id_passport'
  | 'educational_certificate'
  | 'experience_certificate';

// ------------------------------------------------------------
// customer_requests
// ------------------------------------------------------------

export interface CustomerRequest {
  id: string;
  created_at: string;
  updated_at: string;

  company_name: string;
  contact_person: string;
  job_title: string | null;
  phone_number: string;
  whatsapp_number: string | null;
  email: string;
  company_address: string | null;
  city: string | null;

  service_types: ServiceType[];
  positions_requested: StaffPosition[];
  other_position_note: string | null;

  event_name: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  event_venue: string | null;
  number_of_guests: number | null;
  total_staff_required: number | null;

  staff_breakdown: Partial<Record<StaffPosition, number>>;

  requirements_description: string | null;
  special_instructions: string | null;
  additional_comments: string | null;

  preferred_payment_method: PaymentMethod | null;
  other_payment_note: string | null;

  confirmed_accurate_info: boolean;
  understood_non_binding: boolean;
  agreed_advance_payment: boolean;
  agreed_balance_payment: boolean;
  agreed_terms_conditions: boolean;

  status: RequestStatus;
  quoted_amount: number | null;
  advance_amount_paid: number | null;
}

export type CustomerRequestInsert = Omit<CustomerRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'quoted_amount' | 'advance_amount_paid'>;

// ------------------------------------------------------------
// employee_applications
// ------------------------------------------------------------

export interface EmployeeApplication {
  id: string;
  created_at: string;
  updated_at: string;

  full_name: string;
  gender: string | null;
  date_of_birth: string;
  nationality: string | null;
  phone_number: string;
  whatsapp_number: string | null;
  email: string;
  residential_address: string | null;
  city: string | null;

  emergency_contact_name: string;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string;

  position_applied: StaffPosition;
  other_position_note: string | null;

  highest_education_level: string | null;
  school_or_college: string | null;
  qualification: string | null;

  has_hospitality_experience: boolean;
  previous_company: string | null;
  previous_position: string | null;
  years_of_experience: number | null;

  available_days: string[];
  preferred_shift: ShiftPreference | null;

  skills: string[];
  other_skill_note: string | null;

  medically_fit_to_work: boolean;
  medical_explanation: string | null;

  certified_information_accurate: boolean;
  applicant_signature_name: string | null;
  declaration_date: string | null;

  status: ApplicationStatus;
  reviewer_notes: string | null;
}

export type EmployeeApplicationInsert = Omit<EmployeeApplication, 'id' | 'created_at' | 'updated_at' | 'status' | 'reviewer_notes'>;

// ------------------------------------------------------------
// employee_documents
// ------------------------------------------------------------

export interface EmployeeDocument {
  id: string;
  created_at: string;
  application_id: string;
  document_type: DocumentType;
  storage_bucket: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
}

export type EmployeeDocumentInsert = Omit<EmployeeDocument, 'id' | 'created_at'>;

// ------------------------------------------------------------
// Supabase Database type (for typed client:
//   createClient<Database>(url, key)
// ------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      customer_requests: {
        Row: CustomerRequest;
        Insert: CustomerRequestInsert;
        Update: Partial<CustomerRequestInsert> & { status?: RequestStatus };
        Relationships: [];
      };
      employee_applications: {
        Row: EmployeeApplication;
        Insert: EmployeeApplicationInsert;
        Update: Partial<EmployeeApplicationInsert> & { status?: ApplicationStatus };
        Relationships: [];
      };
      employee_documents: {
        Row: EmployeeDocument;
        Insert: EmployeeDocumentInsert;
        Update: Partial<EmployeeDocumentInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      staff_position: StaffPosition;
      service_type: ServiceType;
      payment_method: PaymentMethod;
      shift_preference: ShiftPreference;
      application_status: ApplicationStatus;
      request_status: RequestStatus;
      document_type: DocumentType;
    };
    CompositeTypes: Record<string, never>;
  };
}