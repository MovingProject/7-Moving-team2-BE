import { Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../interface/quotation.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Quotation, QuotationStatus } from '@prisma/client';
import { QuotationWithRelations } from '../dto/quotation-list.dto';

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
}
