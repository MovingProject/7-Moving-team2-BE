import { PrismaModule } from '@/shared/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { PrismaQuotationRepository } from './infra/prisma-quotation.repository';
import { PrismaReviewRepository } from './infra/prisma-review.repository';
import { QUOTATION_REPOSITORY } from './interface/quotation-repository.interface';
import { REVIEW_REPOSITORY } from './interface/review-repository.interface';
import { REVIEW_SERVICE } from './interface/review-service.interface';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, NotificationModule],
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
