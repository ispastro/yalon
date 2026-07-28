import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Generic middleware: validates req.body against any zod schema,
// replaces req.body with the parsed (typed, coerced) result.
export const validateRequest =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };