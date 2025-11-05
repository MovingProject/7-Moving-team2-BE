import { PresenceService } from '@/modules/chat/ws/presence.service';
import { JwtModule } from '@/shared/jwt/jwt.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CookieModule } from '@/shared/utils/cookie.module';
import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../users/infra/prisma-user.repository';
import { USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { PrismaNotificationRepository } from './infra/prisma-notification.repository';
import { NOTIFICATION_REPOSITORY } from './interface/notification.repository.interface';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './ws/notification.gateway';
import { NotificationController } from './notification.controller';

@Module({
  imports: [JwtModule, CookieModule, PrismaModule],
  controllers: [NotificationController],
  providers: [
    PrismaService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    NotificationService,
    NotificationGateway,
    PresenceService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
