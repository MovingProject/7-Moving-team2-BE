import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const joinRoomBodySchema = z.object({
  roomId: z.string().uuid(),
});

export type JoinRoomBody = z.infer<typeof joinRoomBodySchema>;
export class JoinRoomBodyDto extends createZodDto(joinRoomBodySchema) {}
