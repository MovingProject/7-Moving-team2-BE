import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(30),
});

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;

export class GetNotificationsQueryDto extends createZodDto(getNotificationsQuerySchema) {}
