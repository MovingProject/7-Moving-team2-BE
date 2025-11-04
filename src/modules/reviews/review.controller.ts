import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { getReviewsQuerySchema } from './dto/review.get.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import type { reviewDto } from './dto/review.create.dto';
import type { GetReviewsQueryDto } from './dto/review.get.dto';
import type { IReviewService } from './interface/review-service.interface';
import { REVIEW_SERVICE } from './interface/review-service.interface';

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async createReview(@Body() dto: reviewDto, @AuthUser() user: AccessTokenPayload) {
    return this.reviewService.createReview({
      ...dto,
      consumerId: user.sub,
    });
  }
  @Get(`/drivers/:driverId`)
  async getDriverReviews(@Param(`driverId`) driverId: string, @Query() query: GetReviewsQueryDto) {
    const { cursor, limit } = getReviewsQuerySchema.parse(query);
    return this.reviewService.getDriverReviews(driverId, limit, cursor);
  }

  @Get('/drivers/:driverId/rating')
  async getDriverRatingDistribution(@Param('driverId') driverId: string) {
    return this.reviewService.getDriverRatingDistribution(driverId);
  }
}
