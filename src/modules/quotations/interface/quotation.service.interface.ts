import { QuotationStatus } from '@prisma/client';
import { QuotationSummaryDto } from '../dto/quotation-list.dto';

export interface IQuotationService {
  findDriverQuotationsByStatus(driverId: string, statuses?: QuotationStatus[]): Promise<QuotationSummaryDto[]>;
}
