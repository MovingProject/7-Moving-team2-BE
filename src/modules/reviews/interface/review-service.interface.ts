import { Review } from '@prisma/client';
import { ReviewListResponseDto } from '../dto/review.get.dto';
import { reviewDto, reviewInput } from '../dto/review.create.dto';

export interface IReviewService {
  createReview(input: reviewDto & { consumerId: string }): Promise<Review>;
  getDriverReviews(driverId: string, limit: number, cursor?: string): Promise<ReviewListResponseDto>;
  getDriverRatingDistribution(driverId: string): Promise<{
    driverId: string;
    totalReviews: number;
    averageRating: number;
    ratings: Record<number, number>;
  }>;

}

export const REVIEW_SERVICE = 'IReviewService';
