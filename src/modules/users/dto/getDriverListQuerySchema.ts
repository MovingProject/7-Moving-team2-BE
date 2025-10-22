import { z } from 'zod';
import { AreaSchema, MoveTypeSchema, DriverSortTypeSchema } from '@/shared/constant/enums.schema';
import { createZodDto } from '@anatine/zod-nestjs';

export const GetDriverListQuerySchema = z.object({
  area: AreaSchema.optional(),
  type: MoveTypeSchema.optional(),
  sort: DriverSortTypeSchema.default('RATING_DESC'),
  take: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().min(1).optional(),
});

export type GetDriverListQuery = z.infer<typeof GetDriverListQuerySchema>;
export class GetDriverListQuerySchemaDto extends createZodDto(GetDriverListQuerySchema) {}
