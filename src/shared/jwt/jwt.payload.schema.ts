import { z } from 'zod';
import { Role } from '@prisma/client';

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  jti: z.string().uuid(),
});

export const accessTokenPayloadSchema = jwtPayloadSchema.extend({
  role: z.nativeEnum(Role),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
