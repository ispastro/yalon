import multer from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;   // 5 MB per file
const MAX_TOTAL_SIZE_BYTES = 20 * 1024 * 1024;  // 20 MB across all files in one request

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
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5, // max 5 document fields defined in the route
  },
  fileFilter: (_req: Request, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400));
    }
    cb(null, true);
  },
});

/**
 * After multer has parsed all files, verify the combined in-memory footprint
 * doesn't exceed the total cap. Call this middleware after the multer handler.
 */
export function checkTotalUploadSize(req: Request, _res: unknown, next: (err?: unknown) => void) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return next();

  const totalBytes = Object.values(files)
    .flat()
    .reduce((sum, f) => sum + f.size, 0);

  if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
    return next(
      new AppError(
        `Total upload size (${(totalBytes / 1024 / 1024).toFixed(1)} MB) exceeds the ${MAX_TOTAL_SIZE_BYTES / 1024 / 1024} MB limit.`,
        413
      )
    );
  }

  next();
}
