import { Inject, Injectable } from '@nestjs/common';
import { IReviewService } from './interface/review-service.interface';
import { REVIEW_REPOSITORY } from './interface/review-repository.interface';
import { readonly } from 'zod/v4';
import type { IReviewRepository } from './interface/review-repository.interface';
import { reviewDTO, reviewInput } from './dto/review.create.dto';
import { BadRequestException, ForbiddenException } from '@/shared/exceptions';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async createReview(input: reviewDTO & { consumerId: string }) {
    const existing = await this.reviewRepository.findByQuotationId(input.quotationId);
    if (existing) throw new BadRequestException('이미 리뷰가 존재합니다.');

    const quotation = await this.reviewRepository.findQuotationById(input.quotationId);
    if (!quotation) throw new BadRequestException('존재하지 않는 견적입니다.');

    if (quotation.consumerId !== input.consumerId) {
      throw new ForbiddenException('본인의 견적에만 리뷰를 작성할 수 있습니다.');
    }

    if (quotation.status !== 'SELECTED') {
      throw new BadRequestException('이사가 완료된 견적만 리뷰를 작성할 수 있습니다.');
    }
    //자꾸 까먹게되네 이게맞나?

    const reviewData: reviewInput = { ...input, driverId: quotation.driverId };

    return this.reviewRepository.createReview(reviewData);
  }
}
