import { z } from 'zod';

const staffPositionEnum = z.enum([
  'waiter_waitress', 'bartender', 'chef', 'cook', 'kitchen_assistant',
  'steward', 'cashier', 'barista', 'cleaner', 'event_support_staff',
  'supervisor', 'other',
]);

const shiftPreferenceEnum = z.enum(['morning', 'afternoon', 'evening', 'night']);

export const employeeApplicationSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  gender: z.string().trim().optional().nullable(),
  date_of_birth: z.string().min(1, 'Date of birth is required'), // ISO date
  nationality: z.string().trim().optional().nullable(),
  phone_number: z.string().trim().min(6, 'Valid phone number is required'),
  whatsapp_number: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Valid email is required'),
  residential_address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),

  emergency_contact_name: z.string().trim().min(1, 'Emergency contact name is required'),
  emergency_contact_relationship: z.string().trim().optional().nullable(),
  emergency_contact_phone: z.string().trim().min(6, 'Emergency contact phone is required'),

  position_applied: staffPositionEnum,
  other_position_note: z.string().trim().optional().nullable(),

  highest_education_level: z.string().trim().optional().nullable(),
  school_or_college: z.string().trim().optional().nullable(),
  qualification: z.string().trim().optional().nullable(),

  has_hospitality_experience: z.boolean().default(false),
  previous_company: z.string().trim().optional().nullable(),
  previous_position: z.string().trim().optional().nullable(),
  years_of_experience: z.number().min(0).optional().nullable(),

  available_days: z.array(z.string()).default([]),
  preferred_shift: shiftPreferenceEnum.optional().nullable(),

  skills: z.array(z.string()).default([]),
  other_skill_note: z.string().trim().optional().nullable(),

  medically_fit_to_work: z.boolean(),
  medical_explanation: z.string().trim().optional().nullable(),

  certified_information_accurate: z.boolean(),
  applicant_signature_name: z.string().trim().optional().nullable(),
  declaration_date: z.string().optional().nullable(),
}).refine(
  (data) => data.medically_fit_to_work || !!data.medical_explanation,
  { message: 'Please explain if you are not medically fit to work.', path: ['medical_explanation'] }
).refine(
  (data) => data.certified_information_accurate === true,
  { message: 'You must certify that the information provided is accurate.', path: ['certified_information_accurate'] }
);

export type EmployeeApplicationInput = z.infer<typeof employeeApplicationSchema>;
