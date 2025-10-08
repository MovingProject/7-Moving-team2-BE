import { MoveTypeSchema } from '@/shared/constant/enums.schema';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const createQuoteRequestBodySchema = z
  .object({
    serviceType: MoveTypeSchema,
    moveAt: z.coerce.date().refine((d) => d.getTime() - Date.now() >= 24 * 3600_000, {
      message: `이사일은 최소 24시간 이후여야 합니다.`,
    }),
    departureAddress: z.string().trim().min(5, { message: '출발지 주소를 정확히 입력해주세요.' }),
    arrivalAddress: z.string().trim().min(5, { message: '도착지 주소를 정확히 입력해주세요.' }),
    departureFloor: z.coerce.number().int().min(1),
    arrivalFloor: z.coerce.number().int().min(1),
    departurePyeong: z.coerce.number().positive(),
    arrivalPyeong: z.coerce.number().positive(),
    departureElevator: z.coerce.boolean(),
    arrivalElevator: z.coerce.boolean(),
    additionalRequirements: z.string().trim().optional(),
  })
  .strict();

export type CreateQuoteRequestBody = z.infer<typeof createQuoteRequestBodySchema>;
export class CreateQuoteRequestBodyDto extends createZodDto(createQuoteRequestBodySchema) {}
