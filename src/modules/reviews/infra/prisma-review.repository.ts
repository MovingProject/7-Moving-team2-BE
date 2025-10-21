import { Injectable } from '@nestjs/common';
import { IReviewRepository } from '../interface/review-repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { reviewInput } from '../dto/review.create.dto';
import { Quotation, Review } from '@prisma/client';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(input: reviewInput): Promise<Review> {
    return this.prisma.review.create({ data: input });
  }

  async findByQuotationId(quotationId: string) {
    return this.prisma.review.findUnique({ where: { quotationId } });
  }

  async findQuotationById(quotationId: string): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({
      where: { id: quotationId },
    });
  }
}
