import { z } from 'zod';
import { MoveTypeSchema } from '@/shared/constant/enums.schema';

export const ConsumerQuotationSchema = z.object({
  quotationId: z.string().uuid(),
  driverId: z.string().uuid(),
  driverName: z.string(),
  driverNickname: z.string(),
  driverImage: z.string().nullable(),
  driverReviewCount: z.number(),
  driverRating: z.number(),
  driverCareerYears: z.number(),
  driverConfirmedCount: z.number(),
  requestId: z.string().uuid(),
  serviceType: z.array(MoveTypeSchema),
  departureAddress: z.string(),
  arrivalAddress: z.string(),
  price: z.number(),
  quotationStatus: z.enum(['PENDING', 'CONCLUDED', 'COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED']),
  moveAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  hasReview: z.boolean(),
});

export type ConsumerQuotationDto = z.infer<typeof ConsumerQuotationSchema>;

// 리뷰와 함께 반환되는 견적 정보
export const QuotationWithReviewSchema = ConsumerQuotationSchema.extend({
  review: z
    .object({
      id: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      content: z.string(),
      createdAt: z.coerce.date(),
    })
    .nullable(),
});

export type QuotationWithReviewDto = z.infer<typeof QuotationWithReviewSchema>;
