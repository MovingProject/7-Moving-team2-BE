import { z } from 'zod';
import { ActionSource, ActionState } from '@prisma/client';
export const driverRequestActionSchema = z.object({
  requestId: z.string().uuid(),
  note: z.string().optional(),
});

export type DriverRequestActionDTO = z.infer<typeof driverRequestActionSchema>;
export type CreateDriverRequestActionInput = DriverRequestActionDTO & {
  driverId: string;
  state: 'REJECTED';
  source: 'INVITED' | 'GENERAL';
};
