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

  async createReviewWithCountIncrement(input: reviewInput): Promise<Review> {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({ data: input });

      const grouped = await tx.review.groupBy({
        by: ['rating'],
        where: { driverId: input.driverId },
        _count: { rating: true },
      });

      const total = grouped.reduce((acc, r) => acc + r._count.rating, 0);
      const average = grouped.reduce((acc, r) => acc + r.rating * r._count.rating, 0) / (total || 1);

      // DriverProfile 갱신
      await tx.driverProfile.update({
        where: { userId: input.driverId },
        data: {
          reviewCount: total,
          rating: Number(average.toFixed(2)),
        },
      });

      return review;
    });
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
    const take = Number(limit) || 10;
    const reviews = await this.prisma.review.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
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

  async updateDriverRatingAndCount(driverId: string, avgRating: number, totalReviews: number): Promise<void> {
    await this.prisma.driverProfile.update({
      where: { userId: driverId },
      data: {
        rating: Number(avgRating.toFixed(2)),
        reviewCount: totalReviews,
      },
    });
  }
}
