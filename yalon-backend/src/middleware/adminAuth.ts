import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from './errorHandler';

/**
 * Verifies the Bearer JWT in Authorization header using Supabase,
 * then checks that the user has role === 'staff' in their user_metadata.
 * Attaches the verified user to req for downstream use.
 */
export async function requireStaff(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header.', 401));
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return next(new AppError('Invalid or expired session token.', 401));
  }

  const role = data.user.app_metadata?.role;
  if (role !== 'staff') {
    return next(new AppError('Access denied. Staff role required.', 403));
  }

  // Attach user to request for downstream handlers if needed
  (req as Request & { staffUser: typeof data.user }).staffUser = data.user;

  next();
}
