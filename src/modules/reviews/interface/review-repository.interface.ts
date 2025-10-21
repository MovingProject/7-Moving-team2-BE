import { Quotation, Review } from '@prisma/client';
import { reviewInput } from '../dto/review.create.dto';

export interface IReviewRepository {
  createReview(input: reviewInput): Promise<Review>;
  findByQuotationId(quotationId: string): Promise<Review | null>;
  findQuotationById(quotationId: string): Promise<Quotation | null>;
}

export const REVIEW_REPOSITORY = 'IReviewRepository';
