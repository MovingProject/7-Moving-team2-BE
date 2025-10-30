import { Injectable } from '@nestjs/common';

import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Quotation, QuotationStatus } from '@prisma/client';
import { QuotationWithRelations } from '../dto/quotation-list.dto';
import { CreateQuotationInput, IQuotationRepository } from '../interface/quotation.repository.interface';

@Injectable()
export class PrismaQuotationRepository implements IQuotationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDriverQuotations(driverId: string, statuses: QuotationStatus[]): Promise<QuotationWithRelations[]> {
    return this.prisma.quotation.findMany({
      where: { driverId, status: { in: statuses } },
      include: {
        consumer: { select: { name: true } },
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

  async create(input: CreateQuotationInput, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);
    const quotation = await db.quotation.create({
      data: input,
    });
    return quotation;
  }

  async acceptQuotation(id: string): Promise<Quotation> {
    return this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.CONCLUDED,
        selectedAt: new Date(),
      },
    });
  }

  async rejectOtherQuotations(requestId: string, excludeQuotationId: string): Promise<void> {
    await this.prisma.quotation.updateMany({
      where: { requestId, id: { not: excludeQuotationId } },
      data: { status: QuotationStatus.REJECTED },
    });
    return;
  }
}
