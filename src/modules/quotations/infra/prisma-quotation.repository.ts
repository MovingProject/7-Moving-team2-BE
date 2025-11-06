import { Injectable } from '@nestjs/common';

import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Quotation, QuotationStatus } from '@prisma/client';
import { QuotationWithRelations, QuotationWithRelationsPlusId } from '../dto/quotation-list.dto';
import { CreateQuotationInput, IQuotationRepository } from '../interface/quotation.repository.interface';

@Injectable()
export class PrismaQuotationRepository implements IQuotationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDriverQuotations(
    driverId: string,
    statuses: QuotationStatus[],
    ctx?: TransactionContext,
  ): Promise<QuotationWithRelations[]> {
    const db = getDb(ctx, this.prisma);

    return db.quotation.findMany({
      where: { driverId, status: { in: statuses } },
      include: {
        consumer: { select: { id: true, name: true } },
        driver: { select: { id: true } },
        request: {
          select: {
            moveAt: true,
            departureAddress: true,
            arrivalAddress: true,
            invites: { select: { driverId: true } },
          },
        },
      },
    });
  }

  async findConsumerQuotations(consumerId: string, statuses: QuotationStatus[], ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);

    return db.quotation.findMany({
      where: {
        consumerId,
        status: { in: statuses },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            driverProfile: {
              select: {
                nickname: true,
                image: true,
                reviewCount: true,
                rating: true,
                careerYears: true,
                confirmedCount: true,
              },
            },
          },
        },
        request: {
          select: {
            id: true,
            serviceType: true,
            departureAddress: true,
            arrivalAddress: true,
            moveAt: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(input: CreateQuotationInput, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);

    const quotation = await db.quotation.create({
      data: input,
    });
    return quotation;
  }

  async acceptQuotation(id: string, ctx?: TransactionContext): Promise<Quotation> {
    const db = getDb(ctx, this.prisma);

    return db.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.CONCLUDED,
        selectedAt: new Date(),
      },
    });
  }

  async rejectOtherQuotations(requestId: string, excludeQuotationId: string, ctx?: TransactionContext): Promise<void> {
    const db = getDb(ctx, this.prisma);

    await db.quotation.updateMany({
      where: { requestId, id: { not: excludeQuotationId } },
      data: { status: QuotationStatus.REJECTED },
    });
  }

  async findById(id: string, ctx?: TransactionContext): Promise<QuotationWithRelationsPlusId | null> {
    const db = getDb(ctx, this.prisma);

    return db.quotation.findUnique({
      where: { id },
      select: {
        id: true,
        price: true,
        serviceType: true,
        status: true,
        consumer: { select: { id: true, name: true } },
        driver: { select: { id: true } },
        request: {
          select: {
            id: true,
            moveAt: true,
            departureAddress: true,
            arrivalAddress: true,
            invites: { select: { driverId: true } },
          },
        },
      },
    });
  }

  async findUncompletedAfterNow(ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);

    return db.quotation.findMany({
      where: {
        status: { notIn: [QuotationStatus.COMPLETED, QuotationStatus.CANCELLED] },
        moveAt: { gt: new Date() },
      },
    });
  }
  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    return this.prisma.quotation.update({
      where: { id },
      data: { status },
    });
  }
}
