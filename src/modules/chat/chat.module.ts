import { Module } from '@nestjs/common';
import { ChatGateway } from './ws/chat.gateway';
import { JwtModule } from '@/shared/jwt/jwt.module';
import { CookieModule } from '@/shared/utils/cookie.module';
import { PresenceService } from './ws/presence.service';
import { CHATTING_ROOMS_SERVICE } from './interface/chatting-rooms.service.interface';
import ChatService from './chat.service';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { ChattingRoomsController } from './chat.controller';
import { CHATTING_ROOMS_REPOSITORY } from './interface/chatting-rooms.repository.interface';
import { PrismaChattingRoomsRepository } from './infra/prisma.chatting-rooms.repository';
import { USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { PrismaUserRepository } from '../users/infra/prisma-user.repository';
import { REQUEST_REPOSITORY } from '../requests/interface/request.repository.interface';
import { PrismaRequestRepository } from '../requests/infra/prisma-request.repository';

@Module({
  imports: [JwtModule, CookieModule, PrismaModule],
  controllers: [ChattingRoomsController],
  providers: [
    ChatGateway,
    PresenceService,
    { provide: CHATTING_ROOMS_SERVICE, useClass: ChatService },
    { provide: CHATTING_ROOMS_REPOSITORY, useClass: PrismaChattingRoomsRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REQUEST_REPOSITORY, useClass: PrismaRequestRepository },
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
