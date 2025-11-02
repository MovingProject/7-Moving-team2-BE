import { PresenceService } from '@/modules/chat/ws/presence.service';
import { NOTI_EVENTS, type WsServer, type WsSocket } from '@/modules/chat/ws/ws.types';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationEntity, SendNotificationPayload } from '../types';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: WsServer;
  private readonly logger = new Logger(NotificationGateway.name);
  constructor(private readonly presence: PresenceService) {}

  afterInit(server: WsServer) {
    this.server = server;
    this.presence.bindServer(server);
  }

  async handleConnection(client: WsSocket) {
    await this.presence.onConnect(client);

    const user = client.data.user;
    if (user) {
      const room = this.getUserRoom(user.id);
      if (!client.rooms.has(room)) {
        await client.join(room);
        this.logger.debug(`socket ${client.id} joined ${room}`);
      }

      client.emit(NOTI_EVENTS.CONNECTED, {
        userId: user.id,
        message: '알림 채널에 연결되었습니다.',
      });
    } else {
      client.emit('error:event', {
        code: 'AUTH_REQUIRED',
        message: '알림을 받으려면 로그인해주세요.',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: WsSocket) {
    this.presence.onDisconnect(client);
  }

  sendToUser(userId: string, payload: NotificationEntity) {
    const { createdAt, readAt } = payload;
    const createdAtString = createdAt.toISOString();
    const readAtString = readAt?.toISOString() ?? null;
    const sendPayload: SendNotificationPayload = {
      ...payload,
      createdAt: createdAtString,
      readAt: readAtString,
    };
    const room = this.getUserRoom(userId);
    this.server.to(room).emit(NOTI_EVENTS.NEW, sendPayload);
  }

  @SubscribeMessage(NOTI_EVENTS.PING)
  handlePing(@ConnectedSocket() client: WsSocket, @MessageBody() body: unknown) {
    return {
      ok: true,
      now: new Date().toISOString(),
      you: client.data.user ?? null,
      echo: body ?? null,
    };
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }
}
