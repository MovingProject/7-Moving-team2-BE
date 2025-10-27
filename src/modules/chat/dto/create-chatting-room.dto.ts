import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const createChattingRoomBodySchema = z.object({
  requestId: z.string().uuid(),
  consumerId: z.string().uuid(),
});

export type CreateChattingRoomBody = z.infer<typeof createChattingRoomBodySchema>;
export class CreateChattingRoomBodyDto extends createZodDto(createChattingRoomBodySchema) {}
