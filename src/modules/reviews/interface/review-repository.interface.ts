import { Quotation, Review } from '@prisma/client';
import { reviewInput } from '../dto/review.create.dto';

export type ReviewWithConsumer = Review & { consumer: { name: string } };

export interface IReviewRepository {
  createReview(input: reviewInput): Promise<Review>;
  findByQuotationId(quotationId: string): Promise<Review | null>;
  findQuotationById(quotationId: string): Promise<Quotation | null>;
  findReviewsByDriverId(driverId: string, limit: number, cursor?: string): Promise<ReviewWithConsumer[]>;
}

export const REVIEW_REPOSITORY = 'IReviewRepository';
