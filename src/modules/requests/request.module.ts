import { PrismaModule } from '@/shared/prisma/prisma.module';
import { CookiesService } from '@/shared/utils/cookies.service';
import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { PrismaInviteRepository } from './infra/prisma-invite.repository';
import { PrismaRequestRepository } from './infra/prisma-request.repository';
import { INVITE_REPOSITORY } from './interface/invite.repository.interface';
import { REQUEST_REPOSITORY } from './interface/request.repository.interface';
import { REQUEST_SERVICE } from './interface/request.service.interface';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
  imports: [UsersModule, PrismaModule, NotificationModule],
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
