import { Review } from '@prisma/client';
import { reviewDTO, reviewInput } from '../dto/review.create.dto';
import { ReviewListResponseDto } from '../dto/review.get.dto';

export interface IReviewService {
  createReview(input: reviewDTO & { consumerId: string }): Promise<Review>;
  getDriverReviews(driverId: string, limit: number, cursor?: string): Promise<ReviewListResponseDto>;
}

export const REVIEW_SERVICE = 'IReviewService';
