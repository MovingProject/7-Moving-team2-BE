import { z } from 'zod';

export const CreateSocialUserSchema = z.object({
  provider: z.string(),
  providerId: z.string(),
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
  role: z.enum(['CONSUMER', 'DRIVER']).optional(),
});

export type CreateSocialUserDto = z.infer<typeof CreateSocialUserSchema>;
