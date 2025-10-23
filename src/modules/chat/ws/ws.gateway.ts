import type { IJwtService } from '@/shared/jwt/jwt.service.interface';
import { JWT_SERVICE } from '@/shared/jwt/jwt.service.interface';
import { parseCookies } from '@/shared/utils/cookie.util';
import { CookiesService } from '@/shared/utils/cookies.service';
import { Inject } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import type { JwtAccess, SocketUser, WsServer, WsSocket } from './ws.types';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private server!: WsServer;
  private latestSocketByUser = new Map<string, string>();

  constructor(
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
    private readonly cookies: CookiesService,
  ) {}

  afterInit(server: WsServer) {
    this.server = server;
  }

  private extractAccessToken(client: WsSocket): string | undefined {
    const cookies = parseCookies(client.handshake.headers?.cookie);
    const accessCookieName = this.cookies.accessCookieName;
    return cookies[accessCookieName];
  }

  async handleConnection(client: WsSocket): Promise<void> {
    try {
      const token = this.extractAccessToken(client);
      if (!token) {
        client.emit('error:event', { code: 'NO_TOKEN', message: '인증 쿠키가 없습니다.' });
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAccessToken<JwtAccess>(token);
      const user: SocketUser = { id: payload.sub, role: payload.role, jti: payload.jti };

      client.data.user = user;
      client.data.tokenExp = payload.exp;

      const prev = this.latestSocketByUser.get(user.id);
      if (prev && prev !== client.id) this.server.sockets.sockets.get(prev)?.disconnect(true);
      this.latestSocketByUser.set(user.id, client.id);

      await client.join(`user:${user.id}`);

      client.emit('conn:ok', { userId: user.id, role: user.role });
    } catch (e) {
      const expired = /expired|jwt expired/i.test(String((e as Error).message ?? ''));
      client.emit('error:event', {
        code: expired ? 'ACCESS_TOKEN_EXPIRED' : 'AUTH_FAILED',
        message: expired ? '로그인이 만료되었습니다.' : '인증 실패',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: WsSocket): void {
    const user = client.data.user;
    if (user && this.latestSocketByUser.get(user.id) === client.id) {
      this.latestSocketByUser.delete(user.id);
    }
  }
}
