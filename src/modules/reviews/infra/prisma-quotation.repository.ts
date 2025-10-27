import { Injectable } from '@nestjs/common';
import { IQuotationRepository } from '../interface/quotation-repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Quotation } from '@prisma/client';

@Injectable()
export class PrismaQuotationRepository implements IQuotationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findQuotationById(quotationId: string): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({
      where: { id: quotationId },
    });
  }
}
