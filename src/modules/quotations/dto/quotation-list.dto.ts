import { MoveType, QuotationStatus } from '@prisma/client';
import { MoveTypeSchema } from '@/shared/constant/enums.schema';

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
export type QuotationWithRelations = {
  id: string;
  price: number;
  status: QuotationStatus;
  serviceType: MoveType;
  consumer: { id: string; name: string };
  driver: { id: string };
  request: {
    moveAt: Date;
    departureAddress: string;
    arrivalAddress: string;
    invites: { driverId: string }[];
  };
};
export type QuotationWithRelationsPlusId = QuotationWithRelations & {
  request: QuotationWithRelations['request'] & { id: string };
};
