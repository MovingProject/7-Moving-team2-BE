import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { joinRoomBodySchema } from './dto/join-room.dto';
import { PresenceService } from './presence.service';
import { ChatRoomWsService } from './room.service';
import { type WsServer, type WsSocket } from './ws.types';
import { fail } from './ws.ack';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server!: WsServer;
  constructor(
    private readonly presence: PresenceService,
    private readonly roomWs: ChatRoomWsService,
  ) {}

  afterInit(server: WsServer) {
    this.server = server;
    this.presence.bindServer(server);
  }

  async handleConnection(client: WsSocket) {
    await this.presence.onConnect(client);
  }

  handleDisconnect(client: WsSocket) {
    this.presence.onDisconnect(client);
  }

  @SubscribeMessage('chat:join')
  async handleChatJoin(@ConnectedSocket() client: WsSocket, @MessageBody() body: unknown) {
    const parsed: ReturnType<(typeof joinRoomBodySchema)['safeParse']> = joinRoomBodySchema.safeParse(body);

    if (!parsed.success) return fail('VALIDATION_FAILED', 'roomId 형식이 올바르지 않습니다.');
    try {
      return await this.roomWs.joinRoom(client, parsed.data.roomId);
    } catch {
      return fail('JOIN_INTERNAL_ERROR', '일시적인 오류입니다.');
    }
  }
}
