import { MoveTypeSchema } from '@/shared/constant/enums.schema';
import { z } from 'zod';

export const SEND_LIMITS = {
  TEMP_ID_MAX: 64,
  BODY_MAX: 2000,
  ADDRESS_MAX: 200,
  REQ_MAX: 2000,
  PRICE_MAX: 1_000_000_000,
};

// 공통(분기 외 공통 필드만)
const baseCommon = z.object({
  roomId: z.string().uuid(),
  tempId: z.string().min(1, 'tempId는 필수입니다.').max(SEND_LIMITS.TEMP_ID_MAX),
});

// 메시지 분기
const messageBranch = z.object({
  messageType: z.literal('MESSAGE'),
  content: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, '메시지 본문이 비어있습니다.').max(SEND_LIMITS.BODY_MAX)),
});

// 견적 분기 (Quotation)
const quotationBranch = z.object({
  messageType: z.literal('QUOTATION'),
  quotation: z.object({
    serviceType: MoveTypeSchema,
    moveAt: z.coerce.date(),

    // 출발지
    departureAddress: z.string().min(1).max(SEND_LIMITS.ADDRESS_MAX),
    departureFloor: z.number().int().min(0),
    departurePyeong: z.number().positive(),
    departureElevator: z.boolean(),

    // 도착지
    arrivalAddress: z.string().min(1).max(SEND_LIMITS.ADDRESS_MAX),
    arrivalFloor: z.number().int().min(0),
    arrivalPyeong: z.number().positive(),
    arrivalElevator: z.boolean(),
    additionalRequirements: z
      .string()
      .max(SEND_LIMITS.REQ_MAX)
      .optional()
      .transform((v) => (v?.trim() ? v : undefined)),
    price: z.number().int().min(0).max(SEND_LIMITS.PRICE_MAX),

    previousQuotationId: z.string().uuid().optional(),
    validUntil: z.coerce.date().optional(), // DateTime → Date 객체로
  }),
});

export const sendMessageBodySchema = baseCommon.and(
  z.discriminatedUnion('messageType', [messageBranch, quotationBranch]).superRefine((val, ctx) => {
    if (val.messageType === 'MESSAGE' && 'quotation' in (val as any)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MESSAGE 타입에는 quotation이 올 수 없습니다.' });
    }
    if (val.messageType === 'QUOTATION' && 'content' in (val as any)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'QUOTATION 타입에는 content가 올 수 없습니다.' });
    }
  }),
);

export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
