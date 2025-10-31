import z from 'zod';

export const AcceptQuotationDto = z.object({});

export type AcceptQuotationDto = z.infer<typeof AcceptQuotationDto>;
