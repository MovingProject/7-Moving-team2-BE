import { z } from 'zod';
import { ActionSource, ActionState } from '@prisma/client';
export const driverRequestActionSchema = z.object({
  requestId: z.string().uuid(),
  state: z.nativeEnum(ActionState),
  source: z.nativeEnum(ActionSource),
  note: z.string().optional(),
});

export type DriverRequestActionDTO = z.infer<typeof driverRequestActionSchema>;
export type CreateDriverRequestActionInput = DriverRequestActionDTO & { driverId: string };
