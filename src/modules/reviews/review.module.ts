import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { REVIEW_SERVICE } from './interface/review-service.interface';
import { ReviewService } from './review.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { REVIEW_REPOSITORY } from './interface/review-repository.interface';
import { PrismaReviewRepository } from './infra/prisma-review.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [
    {
      provide: REVIEW_SERVICE,
      useClass: ReviewService,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: PrismaReviewRepository,
    },
  ],
  exports: [REVIEW_SERVICE],
})
export class ReviewModule {}
