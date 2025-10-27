import { Inject, Injectable } from '@nestjs/common';
import { IReviewService } from './interface/review-service.interface';
import { REVIEW_REPOSITORY } from './interface/review-repository.interface';
import { readonly } from 'zod/v4';
import type { IReviewRepository } from './interface/review-repository.interface';
import { ReviewListResponseDto, ReviewResponseDto } from './dto/review.get.dto';
import { reviewDto, reviewInput } from './dto/review.create.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@/shared/exceptions';
import { QUOTATION_REPOSITORY } from './interface/quotation-repository.interface';
import type { IQuotationRepository } from './interface/quotation-repository.interface';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async createReview(input: reviewDto & { consumerId: string }) {
    const quotation = await this.quotationRepository.findQuotationById(input.quotationId);
    if (!quotation) throw new NotFoundException('존재하지 않는 견적입니다.');

    if (quotation.consumerId !== input.consumerId) {
      throw new ForbiddenException('본인의 견적에만 리뷰를 작성할 수 있습니다.');
    }

    if (quotation.status !== 'CONCLUDED') {
      throw new UnprocessableEntityException('이사가 완료된 견적만 리뷰를 작성할 수 있습니다.');
    }
    const existing = await this.reviewRepository.findByQuotationId(input.quotationId);
    if (existing) throw new ConflictException('이미 리뷰가 존재합니다.');

    const reviewData: reviewInput = { ...input, driverId: quotation.driverId };

    return this.reviewRepository.createReviewWithCountIncrement(reviewData);
  }

  async getDriverReviews(driverId: string, limit: number, cursor: string): Promise<ReviewListResponseDto> {
    const reviews = await this.reviewRepository.findReviewsByDriverId(driverId, limit, cursor);
    if (!reviews || reviews.length === 0) {
      throw new NotFoundException('해당 드라이버에 대한 리뷰가 없습니다.');
    }

    const hasNextPage = reviews.length > limit;
    const slicedReviews = hasNextPage ? reviews.slice(0, limit) : reviews;

    const reviewDtos: ReviewResponseDto[] = slicedReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      consumerName: r.consumer.name,
      createdAt: r.createdAt.toISOString(),
    }));
    return {
      reviews: reviewDtos,
      nextCursor: hasNextPage ? slicedReviews[slicedReviews.length - 1].id : null,
    };
  }

  async getDriverRatingDistribution(driverId: string) {
    const grouped = await this.reviewRepository.findRatingStatsByDriverId(driverId);

    if (!grouped || grouped.length === 0) {
      throw new NotFoundException('해당 드라이버에 대한 리뷰가 없습니다.');
    }

    const total = grouped.reduce((acc, r) => acc + r._count.rating, 0);

    const average = grouped.reduce((acc, r) => acc + r.rating * r._count.rating, 0) / (total || 1);

    const ratings: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    grouped.forEach((r) => {
      ratings[r.rating] = r._count.rating;
    });

    return {
      driverId,
      totalReviews: total,
      averageRating: Number(average.toFixed(2)),
      ratings,
    };
  }
}
