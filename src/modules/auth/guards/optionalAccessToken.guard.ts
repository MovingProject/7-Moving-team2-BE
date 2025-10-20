// auth/guards/optionalAccessToken.guard.ts
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/jwt.service.interface';
import { CookiesService } from '@/shared/utils/cookies.service';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { UnauthorizedException } from '@/shared/exceptions/unauthorized.exception';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class OptionalAccessTokenGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE) private readonly jwtService: IJwtService,
    private readonly cookiesService: CookiesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const tokenName = this.cookiesService.accessCookieName;
    const token = req.cookies?.[tokenName] as string | undefined;

    if (!token) {
      req.user = null;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAccessToken<AccessTokenPayload>(token);
      req.user = payload;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('액세스 토큰이 만료되었습니다.', { errorType: 'TOKEN_EXPIRED' });
      }
      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('아직 유효하지 않은 액세스 토큰입니다.', { errorType: 'TOKEN_NOT_BEFORE' });
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('유효하지 않은 액세스 토큰입니다.', {
          errorType: 'TOKEN_INVALID',
          errorMessage: error.message,
        });
      }
      throw new UnauthorizedException('유효하지 않은 액세스 토큰입니다.', { errorType: 'UnknownError' });
    }
  }
}
