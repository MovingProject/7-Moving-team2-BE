import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  const request: Request = ctx.switchToHttp().getRequest();
  const user = request.user as AccessTokenPayload | undefined;

  if (!user) {
    throw new UnauthorizedException(
      'Access token payload가 존재하지 않습니다. 이 데코레이터를 사용하려면 @UseGuards(AccessTokenGuard)가 필요합니다.',
    );
  }
  return user;
});

export const AuthUserOptional = createParamDecorator((data, ctx): AccessTokenPayload | null => {
  const req: Request = ctx.switchToHttp().getRequest();
  return (req.user as AccessTokenPayload | undefined) ?? null;
});
