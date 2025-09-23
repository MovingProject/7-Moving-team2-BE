import { z } from 'zod';

export const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  NEXT_URL: z.string().url().optional(),
  EXTRA_ORIGINS: z.string().url().optional(),
  DATABASE_URL: z.string().url(),
});
