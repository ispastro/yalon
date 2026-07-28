import { Router, Request, Response, NextFunction } from 'express';
import { formRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { upload } from '../middleware/uploadHandler';
import { employeeApplicationSchema } from '../validators/employeeApplication.schema';
import { submitEmployeeApplication } from '../controllers/employeeApplications.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const employeeApplicationsRouter = Router();

// Multipart form fields for the 5 uploadable documents.
const documentUploadFields = upload.fields([
  { name: 'passport_photo', maxCount: 1 },
  { name: 'cv_resume', maxCount: 1 },
  { name: 'national_id_passport', maxCount: 1 },
  { name: 'educational_certificate', maxCount: 1 },
  { name: 'experience_certificate', maxCount: 1 },
]);

// Multipart/form-data sends every non-file field as a string, so array/boolean/
// number fields (available_days, skills, has_hospitality_experience, etc.)
// need to be parsed back into real types before zod validation runs.
function parseMultipartFields(req: Request, _res: Response, next: NextFunction) {
  const arrayFields = ['available_days', 'skills'];
  const booleanFields = ['has_hospitality_experience', 'medically_fit_to_work', 'certified_information_accurate'];
  const numberFields = ['years_of_experience'];

  for (const field of arrayFields) {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        req.body[field] = req.body[field].split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  }

  for (const field of booleanFields) {
    if (typeof req.body[field] === 'string') {
      req.body[field] = req.body[field] === 'true';
    }
  }

  for (const field of numberFields) {
    if (typeof req.body[field] === 'string' && req.body[field] !== '') {
      req.body[field] = Number(req.body[field]);
    }
  }

  next();
}

employeeApplicationsRouter.post(
  '/',
  formRateLimiter,
  documentUploadFields,
  parseMultipartFields,
  validateRequest(employeeApplicationSchema),
  asyncHandler(submitEmployeeApplication)
);
