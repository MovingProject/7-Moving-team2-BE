import { z } from 'zod';
import { Area, MoveType } from '@prisma/client';

export const ReceivedRequestFilterSchema = z.object({
  serviceTypes: z.array(z.nativeEnum(MoveType)).optional(),
  areas: z.array(z.nativeEnum(Area)).optional(),
  isInvited: z.boolean().optional(),
  consumerName: z.string().optional(),
  moveAtFrom: z.string().optional(),
  moveAtTo: z.string().optional(),
  sortByMoveAt: z.enum(['asc', 'desc']).optional(),
  sortByCreatedAt: z.enum(['asc', 'desc']).optional(),
});

export type ReceivedRequestFilter = z.infer<typeof ReceivedRequestFilterSchema>;
