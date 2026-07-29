import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  ALLOWED_ORIGIN: z.string().default('*'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  BREVO_API_KEY: z.string().min(1),
  SENDER_EMAIL: z.string().email(),
  RECEIVER_EMAIL: z.string().email(),

  EMPLOYEE_DOCS_BUCKET: z.string().default('employee-documents'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud on boot — never start with a broken config.
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
};