import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const getLikedDriversQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .preprocess((v) => {
      const num = Number(v);
      if (isNaN(num) || num < 1) return 10;
      if (num > 50) return 50;
      return num;
    }, z.number().int())
    .optional()
    .default(10),
});

export type GetLikedDriversQuerySchema = z.infer<typeof getLikedDriversQuerySchema>;
export class GetLikedDriversQuerySchemaDto extends createZodDto(getLikedDriversQuerySchema) {}
