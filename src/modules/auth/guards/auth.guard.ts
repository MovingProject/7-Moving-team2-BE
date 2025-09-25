import { UnauthorizedException } from '@/shared/exceptions/unauthorized.exception';
import { AccessTokenPayload } from '@/shared/jwt/jwt.service.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies?.['__Host-access_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 쿠키에 존재하지 않습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = payload;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.', {
          errorType: error.name,
          errorMessage: error.message,
        });
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.', {
        errorType: 'UnknownError',
        errorMessage: 'An unexpected error occurred during token verification.',
      });
    }
    return true;
  }
}
