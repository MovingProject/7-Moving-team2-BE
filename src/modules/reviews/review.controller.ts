import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { REVIEW_SERVICE } from './interface/review-service.interface';
import type { IReviewService } from './interface/review-service.interface';
import type { reviewDTO, reviewInput } from './dto/review.create.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import type { GetReviewsQueryDto } from './dto/review.get.dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
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
  @Get(`/drivers/:driversId`)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async getDriverReviews(@Param(`driversId`) driversId: string, @Query() query: GetReviewsQueryDto) {
    const { cursor, limit } = query;
    return this.reviewService.getDriverReviews(driversId, limit, cursor);
  }
}
