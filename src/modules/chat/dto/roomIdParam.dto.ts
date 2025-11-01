import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid(),
});

export type RoomIdParam = z.infer<typeof roomIdParamSchema>;
export class RoomIdParamDto extends createZodDto(roomIdParamSchema) {}
