import { z } from 'zod';

const staffPositionEnum = z.enum([
  'waiter_waitress', 'bartender', 'chef', 'cook', 'kitchen_assistant',
  'steward', 'cashier', 'barista', 'cleaner', 'event_support_staff',
  'supervisor', 'other',
]);

const serviceTypeEnum = z.enum(['hospitality_staffing', 'event_staffing']);

const paymentMethodEnum = z.enum(['bank_transfer', 'telebirr', 'cbe_birr', 'cash', 'other']);

export const customerRequestSchema = z.object({
  company_name: z.string().trim().min(1, 'Company/organization name is required'),
  contact_person: z.string().trim().min(1, 'Contact person is required'),
  job_title: z.string().trim().optional().nullable(),
  phone_number: z.string().trim().min(6, 'Valid phone number is required'),
  whatsapp_number: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Valid email is required'),
  company_address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),

  service_types: z.array(serviceTypeEnum).default([]),
  positions_requested: z.array(staffPositionEnum).default([]),
  other_position_note: z.string().trim().optional().nullable(),

  event_name: z.string().trim().optional().nullable(),
  event_date: z.string().optional().nullable(), // ISO date string
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  event_venue: z.string().trim().optional().nullable(),
  number_of_guests: z.number().int().min(0).optional().nullable(),
  total_staff_required: z.number().int().min(0).optional().nullable(),

  staff_breakdown: z.record(staffPositionEnum, z.number().int().min(0)).default({}),

  requirements_description: z.string().trim().optional().nullable(),
  special_instructions: z.string().trim().optional().nullable(),
  additional_comments: z.string().trim().optional().nullable(),

  preferred_payment_method: paymentMethodEnum.optional().nullable(),
  other_payment_note: z.string().trim().optional().nullable(),

  confirmed_accurate_info: z.boolean(),
  understood_non_binding: z.boolean(),
  agreed_advance_payment: z.boolean(),
  agreed_balance_payment: z.boolean(),
  agreed_terms_conditions: z.boolean(),
}).refine(
  (data) =>
    data.confirmed_accurate_info &&
    data.understood_non_binding &&
    data.agreed_advance_payment &&
    data.agreed_balance_payment &&
    data.agreed_terms_conditions,
  { message: 'All terms & conditions must be agreed to before submitting.' }
);

export type CustomerRequestInput = z.infer<typeof customerRequestSchema>;
