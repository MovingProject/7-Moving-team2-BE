import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtService } from '@/shared/jwt/jwt.service.interface';
import { AccessTokenPayload, JwtPayload } from './jwt.payload.schema';

@Injectable()
export class NestjsJwtService implements IJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
  }

  async verifyAccessToken<T extends AccessTokenPayload = AccessTokenPayload>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }

  async verifyRefreshToken<T extends JwtPayload = JwtPayload>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
