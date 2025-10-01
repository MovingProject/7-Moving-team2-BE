import { z } from 'zod';
import { timeStringRegex } from '../constant/regex';

export const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  NEXT_URL: z.string().url(),
  NEXT_PREVIEW_URL: z.string().url().optional(),
  EXTRA_ORIGINS: z.string().url().optional(),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .regex(timeStringRegex, {
      message: 'JWT_ACCESS_EXPIRES_IN must be a valid time string (e.g., "15m", "1h")',
    })
    .default('15m'),
  JWT_ACCESS_MAX_AGE_MS: z.coerce.number().optional().default(900000),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(timeStringRegex, {
      message: 'JWT_REFRESH_EXPIRES_IN must be a valid time string (e.g., "7d")',
    })
    .default('7d'),
  JWT_REFRESH_MAX_AGE_MS: z.coerce.number().optional().default(604800000),
  JWT_ISSUER: z.string().url(),
  ACCESS_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
  REFRESH_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
  ACCESS_COOKIE_PREFIX: z.string().optional(),
  REFRESH_COOKIE_PREFIX: z.string().optional(),
  REFRESH_COOKIE_DOMAIN: z.string().optional(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});
