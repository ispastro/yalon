import { Router, Request, Response } from 'express';
import { requireStaff } from '../middleware/adminAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { supabaseAdmin } from '../config/supabase';
import { getSignedDocumentUrl } from '../services/storage.service';
import { AppError } from '../middleware/errorHandler';

export const adminRouter = Router();

// All admin routes require a valid staff session.
adminRouter.use(asyncHandler(requireStaff));

/**
 * GET /admin/documents/:id/signed-url
 *
 * Looks up the document record by its UUID, then generates a short-lived
 * signed URL for the private storage object. The signed URL is returned
 * to the admin frontend so documents can be viewed without ever making
 * the storage bucket public.
 */
adminRouter.get(
  '/documents/:id/signed-url',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: doc, error } = await supabaseAdmin
      .from('employee_documents')
      .select('storage_path')
      .eq('id', id)
      .single<{ storage_path: string }>();

    if (error || !doc) {
      throw new AppError('Document not found.', 404);
    }

    const signedUrl = await getSignedDocumentUrl(doc.storage_path);

    res.json({ signedUrl });
  })
);
