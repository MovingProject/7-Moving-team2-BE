import { AreaSchema, MoveTypeSchema } from '@/shared/constant/enums.schema';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const createDriverProfileBodySchema = z
  .object({
    image: z.string().optional().nullable(),
    nickname: z.string().trim().min(2, { message: '닉네임은 2글자 이상이어야 합니다.' }),
    careerYears: z.coerce.number().int().min(0),
    oneLiner: z
      .string()
      .trim()
      .min(2, { message: '한줄소개는 2글자 이상이어야 합니다.' })
      .max(50, { message: '한줄소개는 50자 이하이어야 합니다.' }),
    description: z
      .string()
      .trim()
      .min(2, { message: '상세설명은 2글자 이상이어야 합니다.' })
      .max(1000, { message: '상세설명은 1000자 이하이어야 합니다.' }),
    serviceTypes: z
      .array(MoveTypeSchema)
      .min(1, '최소 1개 이상의 서비스 유형을 선택해주세요.')
      .transform((arr) => Array.from(new Set(arr))),
    serviceAreas: z
      .array(AreaSchema)
      .min(1, '최소 1개 이상의 서비스 지역을 선택해주세요.')
      .transform((arr) => Array.from(new Set(arr))),
  })
  .strict();

export type CreateDriverProfileBody = z.infer<typeof createDriverProfileBodySchema>;
export class CreateDriverProfileBodyDto extends createZodDto(createDriverProfileBodySchema) {}
