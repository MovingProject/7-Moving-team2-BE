import { MoveTypeSchema } from '@/shared/constant/enums.schema';
import { QuotationStatus } from '@prisma/client';
import z from 'zod';

export const QuotationSummarySchema = z.object({
  id: z.string().uuid(),
  consumerName: z.string(),
  moveAt: z.coerce.date(),
  departureAddress: z.string(),
  arrivalAddress: z.string(),
  price: z.number(),
  serviceType: MoveTypeSchema,
  isInvited: z.boolean(),
  quotationStatus: z.nativeEnum(QuotationStatus),
});

export type QuotationSummaryDto = z.infer<typeof QuotationSummarySchema>;
