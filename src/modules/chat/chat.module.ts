import { JwtModule } from '@/shared/jwt/jwt.module';
import { PrismaTransactionRunner } from '@/shared/prisma/prisma-transaction-runner';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { TRANSACTION_RUNNER } from '@/shared/prisma/transaction-runner.interface';
import { CookieModule } from '@/shared/utils/cookie.module';
import { Module } from '@nestjs/common';
import { PrismaRequestRepository } from '../requests/infra/prisma-request.repository';
import { REQUEST_REPOSITORY } from '../requests/interface/request.repository.interface';
import { PrismaUserRepository } from '../users/infra/prisma-user.repository';
import { USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { ChattingRoomsController } from './chat.controller';
import ChatService from './chat.service';
import { PrismaChattingRoomsRepository } from './infra/prisma.chatting-rooms.repository';
import { CHATTING_MESSAGES_REPOSITORY } from './interface/chatting-messages.repository.interface';
import { CHATTING_ROOMS_REPOSITORY } from './interface/chatting-rooms.repository.interface';
import { CHATTING_ROOMS_SERVICE } from './interface/chatting-rooms.service.interface';
import { ChatGateway } from './ws/chat.gateway';
import { ChatMessageWsService } from './ws/message.service';
import { PresenceService } from './ws/presence.service';
import { ChatRoomWsService } from './ws/room.service';
import { QUOTATION_REPOSITORY } from '../quotations/interface/quotation.repository.interface';
import { PrismaQuotationRepository } from '../quotations/infra/prisma-quotation.repository';
import { PrismaChattingMessagesRepository } from './infra/prisma.chatting-message.repository';
import { CHATTING_MESSAGES_READ_REPOSITORY } from './interface/chatting-messages-read.repository.interface';
import { PrismaChattingMessagesReadRepository } from './infra/prisma.chatting-messages-read.repository';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [JwtModule, CookieModule, PrismaModule],
  controllers: [ChattingRoomsController],
  providers: [
    ChatGateway,
    PresenceService,
    ChatRoomWsService,
    ChatMessageWsService,
    NotificationService,
    { provide: CHATTING_ROOMS_SERVICE, useClass: ChatService },
    { provide: CHATTING_ROOMS_REPOSITORY, useClass: PrismaChattingRoomsRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REQUEST_REPOSITORY, useClass: PrismaRequestRepository },
    { provide: TRANSACTION_RUNNER, useClass: PrismaTransactionRunner },
    { provide: CHATTING_MESSAGES_REPOSITORY, useClass: PrismaChattingMessagesRepository },
    { provide: QUOTATION_REPOSITORY, useClass: PrismaQuotationRepository },
    { provide: CHATTING_MESSAGES_READ_REPOSITORY, useClass: PrismaChattingMessagesReadRepository },
  ],
  exports: [ChatGateway],
})
export class ChatModule {}
