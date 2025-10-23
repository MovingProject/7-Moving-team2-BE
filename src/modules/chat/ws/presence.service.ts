import { Inject, Injectable } from '@nestjs/common';
import type { WsServer, WsSocket, JwtAccess, SocketUser } from './ws.types';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/jwt.service.interface';
import { CookiesService } from '@/shared/utils/cookies.service';
import { parseCookies } from '@/shared/utils/cookie.util';

@Injectable()
export class PresenceService {
  private server!: WsServer;
  private latestSocketByUser = new Map<string, string>();

  constructor(
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
    private readonly cookies: CookiesService,
  ) {}

  bindServer(server: WsServer) {
    this.server = server;
  }

  private extractAccessToken(client: WsSocket): string | undefined {
    const cookies = parseCookies(client.handshake.headers?.cookie);
    return cookies[this.cookies.accessCookieName];
  }

  async onConnect(client: WsSocket) {
    const token = this.extractAccessToken(client);
    if (!token) {
      client.emit('error:event', { code: 'NO_TOKEN', message: '인증 쿠키가 없습니다.' });
      client.disconnect(true);
      return;
    }

    try {
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

  onDisconnect(client: WsSocket) {
    const user = client.data.user;
    if (user && this.latestSocketByUser.get(user.id) === client.id) {
      this.latestSocketByUser.delete(user.id);
    }
  }
}
