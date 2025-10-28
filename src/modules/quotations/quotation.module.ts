import { Module } from '@nestjs/common';
import { QuotationController } from './quotation.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { QuotationService } from './quotation.service';
import { QUOTATION_REPOSITORY } from './interface/quotation.repository.interface';
import { PrismaQuotationRepository } from './infra/prisma-quotation.repository';

@Module({
  imports: [],
  controllers: [QuotationController],
  providers: [
    PrismaService,
    QuotationService,
    {
      provide: QUOTATION_REPOSITORY,
      useClass: PrismaQuotationRepository,
    },
  ],
  exports: [QuotationService],
})
export class QuotationModule {}
