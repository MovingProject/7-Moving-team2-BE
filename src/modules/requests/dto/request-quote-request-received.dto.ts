import { z } from 'zod';
import { MoveType } from '@prisma/client';

/**
 * @description 받은 요청 단일 아이템
 */
export const ReceivedRequestSchema = z.object({
  id: z.string().uuid(),
  consumerId: z.string().uuid(),
  consumerName: z.string(),
  moveAt: z.coerce.date(),
  departureAddress: z.string(),
  arrivalAddress: z.string(),
  serviceType: z.nativeEnum(MoveType),
  createdAt: z.coerce.date(),
  isInvited: z.boolean(),
});

/**
 * @description 받은 요청 목록 응답
 */
export const ReceivedRequestsResponseSchema = z.array(ReceivedRequestSchema);

// 타입추론
export type ReceivedRequest = z.infer<typeof ReceivedRequestSchema>;
export type ReceivedRequestsResponse = z.infer<typeof ReceivedRequestsResponseSchema>;
