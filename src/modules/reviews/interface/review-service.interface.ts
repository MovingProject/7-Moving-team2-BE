import { Review } from '@prisma/client';
import { reviewDTO, reviewInput } from '../dto/review.create.dto';

export interface IReviewService {
  createReview(input: reviewDTO & { consumerId: string }): Promise<Review>;
}

export const REVIEW_SERVICE = 'IReviewService';
