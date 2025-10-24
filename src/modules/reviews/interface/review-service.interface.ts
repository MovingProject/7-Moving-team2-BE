import { Review } from '@prisma/client';
import { reviewDTO, reviewInput } from '../dto/review.create.dto';
import { ReviewListResponseDto } from '../dto/review.get.dto';

export interface IReviewService {
  createReview(input: reviewDTO & { consumerId: string }): Promise<Review>;
  getDriverReviews(driverId: string, limit: number, cursor?: string): Promise<ReviewListResponseDto>;
  getDriverRatingDistribution(driverId: string): Promise<{
    driverId: string;
    totalReviews: number;
    averageRating: number;
    ratings: Record<number, number>;
  }>;
}

export const REVIEW_SERVICE = 'IReviewService';
