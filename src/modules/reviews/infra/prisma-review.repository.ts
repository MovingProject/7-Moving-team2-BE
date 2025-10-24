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

  async findReviewsByDriverId(driverId: string, limit: number, cursor?: string) {
    const reviews = await this.prisma.review.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        consumer: { select: { name: true } },
      },
    });
    return reviews;
  }

  async findRatingStatsByDriverId(driverId: string) {
    return this.prisma.review.groupBy({
      by: ['rating'],
      where: { driverId },
      _count: { rating: true },
    });
  }
}
