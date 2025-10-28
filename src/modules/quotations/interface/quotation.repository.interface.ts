import { Quotation, QuotationStatus } from '@prisma/client';
import { QuotationWithRelations } from '../dto/quotation-list.dto';

export interface IQuotationRepository {
  findDriverQuotations(driverId: string, statuses: QuotationStatus[]): Promise<QuotationWithRelations[]>;
}

export const QUOTATION_REPOSITORY = 'IQuotationRepository';
