import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Request } from 'express';

// createParamDecorator를 사용해 @AuthUser() 데코레이터를 만듭니다.
export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  const request: Request = ctx.switchToHttp().getRequest();

  if (!request.user) {
    throw new Error(
      'Access token payload가 존재하지 않습니다. 이 데코레이터를 사용하려면 @UseGuards(AccessTokenGuard)가 필요합니다.',
    );
  }

  return request.user;
});
