import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const driverIdParamSchema = z.object({
  driverId: z.string().uuid(),
});

export type DriverIdParam = z.infer<typeof driverIdParamSchema>;
export class DriverIdParamDto extends createZodDto(driverIdParamSchema) {}
