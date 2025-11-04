import { RequestStatus } from '@prisma/client';
import { MoveTypeSchema, QuotationStatusSchema } from '@/shared/constant/enums.schema';
import z from 'zod';

const DriverProfileSummarySchema = z.object({
  nickname: z.string(), // 기사 닉네임
  oneLiner: z.string().nullable(),
  likeCount: z.number().int(), // 좋아요 수
  reviewCount: z.number().int(), // 리뷰 수
  rating: z.number(), // 평균 평점
  careerYears: z.number().int(), // 경력 (년)
  confirmedCount: z.number().int(), // 완료 건수
  image: z.string().nullable(),
});

const QuotationSchema = z.object({
  id: z.string().uuid(),
  driverNickname: z.string(),
  price: z.number(),
  status: QuotationStatusSchema,
  chattingRoomId: z.string().uuid(),
  serviceType: MoveTypeSchema,
  driverProfile: DriverProfileSummarySchema,
  isInvited: z.boolean(),
  isLiked: z.boolean(),
});

export const RequestListSchema = z.object({
  id: z.string().uuid(),
  departureAddress: z.coerce.string(),
  arrivalAddress: z.coerce.string(),
  createdAt: z.string().datetime(),
  requestStatus: z.nativeEnum(RequestStatus),
  additionalRequirements: z.string().nullable(),
  serviceType: MoveTypeSchema,
  moveAt: z.coerce.date(),
  quotations: z.array(QuotationSchema),
});

export type DriverProfileSummaryDto = z.infer<typeof DriverProfileSummarySchema>;
export type QuotationDto = z.infer<typeof QuotationSchema>;
export type RequestListDto = z.infer<typeof RequestListSchema>;
