import { z } from 'zod';
import { QuotationStatus } from '@prisma/client';

export const UpdateQuotationStatusSchema = z.object({
  quotationId: z.string().uuid({ message: 'quotationId는 유효한 UUID여야 합니다.' }),

  moveAt: z.string().datetime({ offset: true, message: 'moveAt은 ISO8601 형식의 날짜여야 합니다.' }),

  status: z.nativeEnum(QuotationStatus).optional().default(QuotationStatus.COMPLETED),
});

export type UpdateQuotationStatusDto = z.infer<typeof UpdateQuotationStatusSchema>;
