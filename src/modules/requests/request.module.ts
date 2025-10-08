import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaRequestRepository } from './prisma-request.repository';
import { REQUEST_SERVICE } from './interface/request.service.interface';
import { REQUEST_REPOSITORY } from './interface/request.repository.interface';
import { UserModule } from '../users/users.module';
import { CookiesService } from '@/shared/utils/cookies.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [RequestController],
  providers: [
    {
      provide: REQUEST_SERVICE,
      useClass: RequestService,
    },
    {
      provide: REQUEST_REPOSITORY,
      useClass: PrismaRequestRepository,
    },
    CookiesService,
  ],
  exports: [REQUEST_SERVICE],
})
export class RequestModule {}
