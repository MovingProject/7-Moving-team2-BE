import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const chatReadBodySchema = z.object({
  roomId: z.string().uuid(),
  lastReadMessageId: z.string().uuid(),
});

export type ChatReadBody = z.infer<typeof chatReadBodySchema>;
export class ChatReadBodyDto extends createZodDto(chatReadBodySchema) {}
