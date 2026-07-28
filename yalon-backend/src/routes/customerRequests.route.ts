import { Router } from 'express';
import { formRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { customerRequestSchema } from '../validators/customerRequest.schema';
import { submitCustomerRequest } from '../controllers/customerRequests.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const customerRequestsRouter = Router();

customerRequestsRouter.post(
  '/',
  formRateLimiter,
  validateRequest(customerRequestSchema),
  asyncHandler(submitCustomerRequest)
);
