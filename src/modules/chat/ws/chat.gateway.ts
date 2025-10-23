import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import type { WsServer, WsSocket } from './ws.types';
import { PresenceService } from './presence.service';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server!: WsServer;
  constructor(private readonly presence: PresenceService) {}

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
}
