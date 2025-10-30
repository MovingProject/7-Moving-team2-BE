import z from 'zod';

export const AcceptQuotationDto = z.object({
  quotationId: z.string().uuid(),
});

export type AcceptQuotationDto = z.infer<typeof AcceptQuotationDto>;
