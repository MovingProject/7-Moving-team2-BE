import { BadRequestException, ForbiddenException, NotFoundException } from '@/shared/exceptions';
import { PrismaTransactionRunner } from '@/shared/prisma/prisma-transaction-runner';
import { Inject, Injectable } from '@nestjs/common';
import { QuotationStatus } from '@prisma/client';
import { QuotationSummaryDto } from './dto/quotation-list.dto';
import type { IQuotationRepository } from './interface/quotation.repository.interface';
import { QUOTATION_REPOSITORY } from './interface/quotation.repository.interface';
import { Prisma } from '@prisma/client';
import { UpdateQuotationStatusDto } from './dto/quotation-status.dto';
import { scheduleQuotationCompletionJob } from './infra/quotation.scheduler';
import { QuotationWithReviewDto } from './dto/consumer-quotation.dto';

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

  async findConsumerQuotations(consumerId: string): Promise<QuotationWithReviewDto[]> {
    const quotations = await this.quotationRepository.findConsumerQuotations(consumerId, [
      QuotationStatus.CONCLUDED,
      QuotationStatus.COMPLETED,
    ]);

    return quotations.map((q) => ({
      quotationId: q.id,
      driverId: q.driver.id,
      driverName: q.driver.name,
      driverNickname: q.driver.driverProfile?.nickname || q.driver.name,
      driverImage: q.driver.driverProfile?.image || null,
      driverReviewCount: q.driver.driverProfile?.reviewCount || 0,
      driverRating: q.driver.driverProfile?.rating || 0,
      driverCareerYears: q.driver.driverProfile?.careerYears || 0,
      driverConfirmedCount: q.driver.driverProfile?.confirmedCount || 0,
      requestId: q.request.id,
      serviceType: Array.isArray(q.request.serviceType) ? q.request.serviceType : [q.request.serviceType],
      departureAddress: q.request.departureAddress,
      arrivalAddress: q.request.arrivalAddress,
      price: q.price,
      quotationStatus: q.status,
      moveAt: q.request.moveAt,
      createdAt: q.createdAt,
      hasReview: !!q.review,
      review: q.review
        ? {
            id: q.review.id,
            rating: q.review.rating,
            content: q.review.content,
            createdAt: q.review.createdAt,
          }
        : null,
    }));
  }

  async acceptQuotation(quotationId: string, consumerId: string) {
    const quotation = await this.quotationRepository.findById(quotationId);
    if (!quotation) throw new NotFoundException('존재하지 않는 견적입니다.');
    if (quotation.consumer?.id !== consumerId) {
      throw new ForbiddenException('본인의 견적만 수락할 수 있습니다.');
    }

    if (quotation.status !== 'PENDING') throw new BadRequestException('이미 처리된 견적입니다.');

    return this.transactionRunner.run(async (ctx) => {
      const tx = ctx.tx as Prisma.TransactionClient;

      const accepted = await this.quotationRepository.acceptQuotation(quotationId, ctx);

      await tx.request.update({
        where: { id: quotation.request.id },
        data: { requestStatus: 'CONCLUDED', concludedAt: new Date() },
      });

      await this.quotationRepository.rejectOtherQuotations(quotation.request.id, quotationId, ctx);

      const updatedQuotation = await this.quotationRepository.findById(quotationId);
      if (updatedQuotation?.request.moveAt) {
        scheduleQuotationCompletionJob(
          updatedQuotation.id,
          updatedQuotation.request.moveAt,
          this.quotationRepository,
          QuotationStatus.COMPLETED,
        );
        console.log(
          `🕒 quotation ${updatedQuotation.id} 자동 스케줄 등록됨 (moveAt: ${updatedQuotation.request.moveAt.toISOString()})`,
        );
      }
      return accepted;
    });
  }

  async onModuleInit() {
    // 서버 재시작 시, 아직 완료되지 않은 quotation들 다시 스케줄 등록
    const pending = await this.quotationRepository.findUncompletedAfterNow();
    pending.forEach((q) => {
      scheduleQuotationCompletionJob(q.id, q.moveAt, this.quotationRepository);
    });
  }

  async scheduleQuotationCompletion(dto: UpdateQuotationStatusDto) {
    const quotation = await this.quotationRepository.findById(dto.quotationId);
    if (!quotation) throw new NotFoundException('존재하지 않는 견적입니다.');

    if (quotation.status !== QuotationStatus.CONCLUDED) {
      return {
        message: `현재 견적 상태(${quotation.status})에서는 스케줄을 등록할 수 없습니다.`,
        quotationId: quotation.id,
      };
    }

    const moveAtDate = new Date(dto.moveAt);

    if (moveAtDate.getTime() <= Date.now()) {
      await this.quotationRepository.updateStatus(quotation.id, QuotationStatus.COMPLETED);
      return {
        message: 'moveAt이 과거이므로 즉시 COMPLETED 처리되었습니다.',
        quotationId: quotation.id,
      };
    }

    // node-cron 스케줄 등록
    scheduleQuotationCompletionJob(
      quotation.id,
      moveAtDate,
      this.quotationRepository,
      dto.status ?? QuotationStatus.COMPLETED,
    );

    return {
      message: '이사 완료 스케줄 등록 완료',
      quotationId: quotation.id,
      scheduledAt: moveAtDate,
    };
  }
}
