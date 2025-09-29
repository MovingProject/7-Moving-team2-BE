import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtService } from '@/shared/jwt/jwt.service.interface';
import { AccessTokenPayload, JwtPayload } from './jwt.payload.schema';

/**
 * @TODO(nijuuy): JWT 관련 강화 항목은 전부 "공부 후 필요 시 도입"한다.
 * (지금은 최소 설정만 사용)
 * - iss/aud 검증, alg/clockTolerance
 * - env 스키마 검증, 로깅/메트릭, 테스트 케이스
 */
@Injectable()
export class NestjsJwtService implements IJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async verifyAccessToken<T extends AccessTokenPayload = AccessTokenPayload>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async verifyRefreshToken<T extends JwtPayload = JwtPayload>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
