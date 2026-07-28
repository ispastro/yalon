import rateLimit from 'express-rate-limit';

// General limiter for all public form endpoints.
// 20 requests per 15 minutes per IP is generous for a real applicant/customer,
// but blocks basic scripted spam/abuse.
export const formRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
