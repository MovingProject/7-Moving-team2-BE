import { Logger } from '@nestjs/common';
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
import { sendMessageBodySchema } from './dto/send-message.dto';
import { ChatMessageWsService } from './message.service';
import { PresenceService } from './presence.service';
import { ChatRoomWsService } from './room.service';
import { fail } from './ws.ack';
import { WS_EVENTS } from './ws.events';
import { type WsServer, type WsSocket } from './ws.types';
import { chatReadBodySchema } from './dto/chat-read.dto';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server!: WsServer;
  private readonly logger = new Logger(ChatGateway.name);
  constructor(
    private readonly presence: PresenceService,
    private readonly roomWs: ChatRoomWsService,
    private readonly msgWs: ChatMessageWsService,
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

  @SubscribeMessage(WS_EVENTS.CHAT_JOIN)
  async handleChatJoin(@ConnectedSocket() client: WsSocket, @MessageBody() body: unknown) {
    const parsed: ReturnType<(typeof joinRoomBodySchema)['safeParse']> = joinRoomBodySchema.safeParse(body);

    if (!parsed.success) return fail('VALIDATION_FAILED', 'roomId 형식이 올바르지 않습니다.');
    try {
      return await this.roomWs.joinRoom(client, parsed.data.roomId);
    } catch {
      return fail('JOIN_INTERNAL_ERROR', '일시적인 오류입니다.');
    }
  }

  @SubscribeMessage(WS_EVENTS.CHAT_SEND)
  async handleChatSend(@ConnectedSocket() client: WsSocket, @MessageBody() body: unknown) {
    const parsed = sendMessageBodySchema.safeParse(body);
    if (!parsed.success) return fail('VALIDATION_FAILED', '메시지 형식이 올바르지 않습니다.');

    try {
      return await this.msgWs.sendMessage(client, parsed.data);
    } catch (e) {
      this.logger.error(`chat:send failed: ${String((e as Error).message ?? e)}`);
      const tempId = parsed?.data?.tempId ?? undefined;
      return fail('MESSAGE_SEND_FAILED', undefined, { tempId });
    }
  }

  @SubscribeMessage(WS_EVENTS.CHAT_READ)
  handleChatRead(@ConnectedSocket() client: WsSocket, @MessageBody() body: unknown) {
    const parsed = chatReadBodySchema.safeParse(body);
    if (!parsed.success) return fail('VALIDATION_FAILED', '읽은 메시지 정보 형식이 올바르지 않습니다.');

    try {
      return this.msgWs.readMessage(client, parsed.data);
    } catch {
      return fail('READ_INTERNAL_ERROR', '일시적인 오류입니다.');
    }
  }
}
