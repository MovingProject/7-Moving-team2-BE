import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './ws/notification.gateway';
import { PrismaNotificationRepository } from './infra/prisma-notification.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { NOTIFICATION_REPOSITORY } from './interface/notification.repository.interface';
import { PresenceService } from '@/modules/chat/ws/presence.service';
import { JwtModule } from '@/shared/jwt/jwt.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { CookieModule } from '@/shared/utils/cookie.module';

@Module({
  imports: [JwtModule, CookieModule, PrismaModule],
  providers: [
    PrismaService,
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    NotificationService,
    NotificationGateway,
    PresenceService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
