import { Inject, Injectable } from '@nestjs/common';
import { QUOTATION_REPOSITORY } from './interface/quotation.repository.interface';
import type { IQuotationRepository } from './interface/quotation.repository.interface';
import { Prisma, QuotationStatus, RequestStatus } from '@prisma/client';
import { QuotationSummaryDto } from './dto/quotation-list.dto';
import { InternalServerException } from '@/shared/exceptions/internal-server-error.exception';
import { BadRequestException, NotFoundException } from '@/shared/exceptions';
import { PrismaTransactionRunner } from '@/shared/prisma/prisma-transaction-runner';

@Injectable()
export class QuotationService {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
    private readonly transactionRunner: PrismaTransactionRunner,
  ) {}

  async findDriverQuotationsByStatus(driverId: string, statuses?: QuotationStatus[]): Promise<QuotationSummaryDto[]> {
    const targetStatuses =
      statuses && statuses.length > 0
        ? statuses
        : [QuotationStatus.PENDING, QuotationStatus.CONCLUDED, QuotationStatus.COMPLETED];
    const quotations = await this.quotationRepository.findDriverQuotations(driverId, targetStatuses);
    if (!quotations || quotations.length === 0) {
      throw new NotFoundException('보낸 견적서가 없습니다.');
    }

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

  async acceptQuotation(quotationId: string, consumerId: string) {
    const quotation = await this.quotationRepository.findById(quotationId);
    if (!quotation) throw new NotFoundException('존재하지 않는 견적입니다.');

    if (quotation.status !== 'PENDING') throw new BadRequestException('이미 처리된 견적입니다.');

    return this.transactionRunner.run(async (ctx) => {
      const tx = ctx.tx as Prisma.TransactionClient;
      const accepted = await this.quotationRepository.acceptQuotation(quotationId);

      await tx.request.update({
        where: { id: quotation.request.id },
        data: { requestStatus: 'CONCLUDED', concludedAt: new Date() },
      });

      await this.quotationRepository.rejectOtherQuotations(quotation.request.id, quotationId);

      return accepted;
    });
  }
}
