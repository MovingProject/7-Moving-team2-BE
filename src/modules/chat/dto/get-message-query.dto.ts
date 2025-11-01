import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const getMessageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export type GetMessageQuery = z.infer<typeof getMessageQuerySchema>;
export class GetMessageQueryDto extends createZodDto(getMessageQuerySchema) {}
