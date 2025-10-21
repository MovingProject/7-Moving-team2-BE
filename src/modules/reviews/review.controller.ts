import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { REVIEW_SERVICE } from './interface/review-service.interface';
import type { IReviewService } from './interface/review-service.interface';
import type { reviewDTO, reviewInput } from './dto/review.create.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async createReview(@Body() dto: reviewDTO, @AuthUser() user: AccessTokenPayload) {
    return this.reviewService.createReview({
      ...dto,
      consumerId: user.sub,
    });
  }
}
