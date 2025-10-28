import { Inject, Injectable } from '@nestjs/common';
import { QUOTATION_REPOSITORY } from './interface/quotation.repository.interface';
import type { IQuotationRepository } from './interface/quotation.repository.interface';
import { QuotationStatus } from '@prisma/client';
import { QuotationSummaryDto } from './dto/quotation-list.dto';

@Injectable()
export class QuotationService {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async findDriverQuotationsByStatus(driverId: string, statuses?: QuotationStatus[]): Promise<QuotationSummaryDto[]> {
    const targetStatuses =
      statuses && statuses.length > 0
        ? statuses
        : [QuotationStatus.PENDING, QuotationStatus.CONCLUDED, QuotationStatus.COMPLETED];
    const quotations = await this.quotationRepository.findDriverQuotations(driverId, targetStatuses);

    const mappedQuotations = quotations.map((q) => {
      const r = q.request;
      return {
        id: q.id,
        consumerName: q.consumer.name,
        moveAt: r.moveAt,
        departureAddress: r.departureAddress,
        arrivalAddress: r.arrivalAddress,
        price: q.price,
        serviceType: q.serviceType,
        isInvited: r.invites.some((i) => i.driverId === driverId),
        quotationStatus: q.status,
      };
    });

    return mappedQuotations;
  }
}
