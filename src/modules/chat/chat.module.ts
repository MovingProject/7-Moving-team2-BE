import { Module } from '@nestjs/common';
import { ChatGateway } from './ws/ws.gateway';
import { JwtModule } from '@/shared/jwt/jwt.module';
import { CookieModule } from '@/shared/utils/cookie.module';
import { PresenceService } from './ws/presence.service';

@Module({
  imports: [JwtModule, CookieModule],
  providers: [ChatGateway, PresenceService],
  exports: [ChatGateway],
})
export class ChatModule {}
