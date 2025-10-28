import { JwtModule } from '@/shared/jwt/jwt.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { CookieModule } from '@/shared/utils/cookie.module';
import { Module } from '@nestjs/common';
import { PrismaRequestRepository } from '../requests/infra/prisma-request.repository';
import { REQUEST_REPOSITORY } from '../requests/interface/request.repository.interface';
import { PrismaUserRepository } from '../users/infra/prisma-user.repository';
import { USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { ChattingRoomsController } from './chat.controller';
import ChatService from './chat.service';
import { PrismaChattingRoomsRepository } from './infra/prisma.chatting-rooms.repository';
import { CHATTING_ROOMS_REPOSITORY } from './interface/chatting-rooms.repository.interface';
import { CHATTING_ROOMS_SERVICE } from './interface/chatting-rooms.service.interface';
import { ChatGateway } from './ws/chat.gateway';
import { PresenceService } from './ws/presence.service';
import { ChatRoomWsService } from './ws/room.service';

@Module({
  imports: [JwtModule, CookieModule, PrismaModule],
  controllers: [ChattingRoomsController],
  providers: [
    ChatGateway,
    PresenceService,
    ChatRoomWsService,
    { provide: CHATTING_ROOMS_SERVICE, useClass: ChatService },
    { provide: CHATTING_ROOMS_REPOSITORY, useClass: PrismaChattingRoomsRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REQUEST_REPOSITORY, useClass: PrismaRequestRepository },
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
