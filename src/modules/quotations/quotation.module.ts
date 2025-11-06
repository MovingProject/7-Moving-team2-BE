import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { QuotationService } from './quotation.service';
import { QUOTATION_REPOSITORY } from './interface/quotation.repository.interface';
import { PrismaQuotationRepository } from './infra/prisma-quotation.repository';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { CookieModule } from '@/shared/utils/cookie.module';
import { PrismaTransactionRunner } from '@/shared/prisma/prisma-transaction-runner';
import { PrismaDriverProfileRepository } from '../users/infra/prisma-driverProfile.repository';
import { DRIVER_PROFILE_REPOSITORY } from '../users/interface/driverProfile.repository.interface';

@Module({
  imports: [UsersModule, PrismaModule, CookieModule],
  controllers: [QuotationController],
  providers: [
    PrismaService,
    QuotationService,
    PrismaTransactionRunner,
    {
      provide: DRIVER_PROFILE_REPOSITORY,
      useClass: PrismaDriverProfileRepository,
    },
    {
      provide: QUOTATION_REPOSITORY,
      useClass: PrismaQuotationRepository,
    },
  ],
  exports: [QuotationService],
})
export class QuotationModule {}
