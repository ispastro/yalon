import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { DocumentType } from '../types/database.types';

interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

/**
 * Uploads a single document to the private Supabase Storage bucket and
 * records a reference row in `employee_documents`. Files are never made
 * public — access later happens only via short-lived signed URLs generated
 * server-side (see getSignedDocumentUrl below).
 */
export async function uploadEmployeeDocument(
  applicationId: string,
  documentType: DocumentType,
  file: UploadedFile
): Promise<void> {
  const extension = file.originalname.split('.').pop() || 'bin';
  const storagePath = `employees/${applicationId}/${documentType}-${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(env.EMPLOYEE_DOCS_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new AppError(`Failed to upload ${documentType}: ${uploadError.message}`, 500);
  }

  const { error: dbError } = await supabaseAdmin.from('employee_documents').insert({
    application_id: applicationId,
    document_type: documentType,
    storage_bucket: env.EMPLOYEE_DOCS_BUCKET,
    storage_path: storagePath,
    original_filename: file.originalname,
    mime_type: file.mimetype,
    file_size_bytes: file.size,
  });

  if (dbError) {
    throw new AppError(`Failed to save document record for ${documentType}: ${dbError.message}`, 500);
  }
}

/**
 * Generates a short-lived signed URL for an admin to view a private document.
 * Never expose storage_path or a permanent URL directly to the frontend.
 */
export async function getSignedDocumentUrl(storagePath: string, expiresInSeconds = 300): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(env.EMPLOYEE_DOCS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) {
    throw new AppError(`Failed to generate signed URL: ${error?.message ?? 'unknown error'}`, 500);
  }

  return data.signedUrl;
}
