import { z } from 'zod';
import { ActionSource, ActionState } from '@prisma/client';
export const driverRequestActionSchema = z.object({
  driverId: z.string(),
  requestId: z.string(),
  state: z.nativeEnum(ActionState),
  source: z.nativeEnum(ActionSource),
  note: z.string().optional(),
});

export type DriverRequestActionDTO = z.infer<typeof driverRequestActionSchema>;
