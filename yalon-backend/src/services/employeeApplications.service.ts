import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { EmployeeApplicationInput } from '../validators/employeeApplication.schema';
import { sendNotificationEmail } from './email.service';
import { buildEmployeeApplicationEmail } from '../templates/employeeApplicationEmail';
import { uploadEmployeeDocument } from './storage.service';
import type { DocumentType } from '../types/database.types';

interface IncomingFiles {
  [fieldName: string]: Express.Multer.File[] | undefined;
}

export async function createEmployeeApplication(input: EmployeeApplicationInput, files: IncomingFiles) {
  const { data, error } = await supabaseAdmin
    .from('employee_applications')
    .insert(input)
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    const cause = error?.message ?? error?.code ?? 'no data returned';
    throw new AppError(`Failed to save application: ${cause}`, 500);
  }

  const applicationId = data.id;

  const documentFieldMap: Record<string, DocumentType> = {
    passport_photo: 'passport_photo',
    cv_resume: 'cv_resume',
    national_id_passport: 'national_id_passport',
    educational_certificate: 'educational_certificate',
    experience_certificate: 'experience_certificate',
  };

  for (const [fieldName, documentType] of Object.entries(documentFieldMap)) {
    const fileArray = files[fieldName];
    if (fileArray && fileArray[0]) {
      await uploadEmployeeDocument(applicationId, documentType, fileArray[0]);
    }
  }

  const { subject, html } = buildEmployeeApplicationEmail(input);
  void sendNotificationEmail({ subject, html, replyTo: input.email });

  return data;
}