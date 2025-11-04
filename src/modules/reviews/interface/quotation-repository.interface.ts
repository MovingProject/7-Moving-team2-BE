import { Quotation } from '@prisma/client';

export interface IQuotationRepository {
  findQuotationById(quotationId: string): Promise<Quotation | null>;
}

export const QUOTATION_REPOSITORY = 'IQuotationRepository';
