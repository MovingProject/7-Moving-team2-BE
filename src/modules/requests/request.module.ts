import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaRequestRepository } from './infra/prisma-request.repository';
import { REQUEST_SERVICE } from './interface/request.service.interface';
import { REQUEST_REPOSITORY } from './interface/request.repository.interface';
import { UsersModule } from '../users/users.module';
import { CookiesService } from '@/shared/utils/cookies.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { PrismaInviteRepository } from './infra/prisma-invite.repository';
import { INVITE_REPOSITORY } from './interface/invite.repository.interface';

@Module({
  imports: [UsersModule, PrismaModule],
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
    {
      provide: INVITE_REPOSITORY,
      useClass: PrismaInviteRepository,
    },
    CookiesService,
  ],
  exports: [REQUEST_SERVICE],
})
export class RequestModule {}
