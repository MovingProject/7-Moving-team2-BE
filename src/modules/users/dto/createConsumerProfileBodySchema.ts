import { AreaSchema, MoveTypeSchema } from '@/shared/constant/enums.schema';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const createConsumerProfileBodySchema = z
  .object({
    image: z.string().optional().nullable(),
    serviceType: MoveTypeSchema,
    areas: AreaSchema,
  })
  .strict();

export type CreateConsumerProfileBody = z.infer<typeof createConsumerProfileBodySchema>;
export class CreateConsumerProfileBodyDto extends createZodDto(createConsumerProfileBodySchema) {}
