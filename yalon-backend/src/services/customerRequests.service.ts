import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { CustomerRequestInput } from '../validators/customerRequest.schema';
import { sendNotificationEmail } from './email.service';
import { buildCustomerRequestEmail } from '../templates/customerRequestEmail';

export async function createCustomerRequest(input: CustomerRequestInput) {
  const { data, error } = await supabaseAdmin
    .from('customer_requests')
    .insert(input)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new AppError(`Failed to save request: ${error?.message ?? 'no data returned'}`, 500);
  }

  const { subject, html } = buildCustomerRequestEmail(input);
  void sendNotificationEmail({ subject, html, replyTo: input.email });

  return data;
}