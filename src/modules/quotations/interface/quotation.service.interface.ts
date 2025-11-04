import { QuotationStatus } from '@prisma/client';
import { QuotationSummaryDto } from '../dto/quotation-list.dto';
import { UpdateQuotationStatusDto } from '../dto/quotation-status.dto';

export interface IQuotationService {
  findDriverQuotationsByStatus(driverId: string, statuses?: QuotationStatus[]): Promise<QuotationSummaryDto[]>;
  scheduleQuotationCompletion(
    dto: UpdateQuotationStatusDto,
  ): Promise<{ message: string; quotationId: string; scheduledAt?: Date }>;
}
