import { z } from 'zod';
import { Area, MoveType } from '@prisma/client';

export const filterRequestSchema = z.object({
  serviceTypes: z.array(z.nativeEnum(MoveType)).optional(),
  areas: z.array(z.nativeEnum(Area)).optional(),
  isInvited: z.boolean().optional(),
  consumerName: z.string().optional(),
  sortByMoveAt: z.enum(['asc', 'desc']).optional(),
  sortByCreatedAt: z.enum(['asc', 'desc']).optional(),
});

export type ReceivedRequestFilter = z.infer<typeof filterRequestSchema>;
