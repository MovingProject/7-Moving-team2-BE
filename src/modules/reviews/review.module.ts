import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { REVIEW_SERVICE } from './interface/review-service.interface';
import { ReviewService } from './review.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { REVIEW_REPOSITORY } from './interface/review-repository.interface';
import { PrismaReviewRepository } from './infra/prisma-review.repository';
import { PrismaQuotationRepository } from './infra/prisma-quotation.repository';
import { QUOTATION_REPOSITORY } from './interface/quotation-repository.interface';

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
    {
      provide: QUOTATION_REPOSITORY,
      useClass: PrismaQuotationRepository,
    },
  ],
  exports: [REVIEW_SERVICE],
})
export class ReviewModule {}
