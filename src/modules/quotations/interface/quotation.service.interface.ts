import { QuotationStatus } from '@prisma/client';
import { QuotationSummaryDto } from '../dto/quotation-list.dto';
import { UpdateQuotationStatusDto } from '../dto/quotation-status.dto';
import { QuotationWithReviewDto } from '../dto/consumer-quotation.dto';

export interface IQuotationService {
  findDriverQuotationsByStatus(driverId: string, statuses?: QuotationStatus[]): Promise<QuotationSummaryDto[]>;
  findConsumerQuotations(consumerId: string): Promise<QuotationWithReviewDto[]>;
  scheduleQuotationCompletion(
    dto: UpdateQuotationStatusDto,
  ): Promise<{ message: string; quotationId: string; scheduledAt?: Date }>;
}
