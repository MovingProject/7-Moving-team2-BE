import { UnauthorizedException } from '@/shared/exceptions/unauthorized.exception';
import { JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/jwt.service.interface';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { CookiesService } from '@/shared/utils/cookies.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
    private readonly cookiesService: CookiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const tokenName = this.cookiesService.refreshCookieName;
    const token = request.cookies?.[tokenName] as string | undefined;

    if (!token) {
      throw new UnauthorizedException('리프레시 토큰이 쿠키에 존재하지 않습니다.');
    }

    try {
      const payload = await this.jwtService.verifyRefreshToken<JwtPayload>(token);
      request.refresh = payload;
      request.refreshRaw = token;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.', { errorType: 'TOKEN_EXPIRED' });
      }
      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('아직 유효하지 않은 리프레시 토큰입니다.', { errorType: 'TOKEN_NOT_BEFORE' });
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.', {
          errorType: 'TOKEN_INVALID',
          errorMessage: error.message,
        });
      }
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.', { errorType: 'UnknownError' });
    }
  }
}
