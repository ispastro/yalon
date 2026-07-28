import multer from 'multer';
import { AppError } from './errorHandler';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

// Memory storage — files are held in a buffer, never written to local disk,
// then streamed straight to Supabase Storage. Keeps the server stateless.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400));
    }
    cb(null, true);
  },
});
