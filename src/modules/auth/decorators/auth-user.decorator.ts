import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '@/shared/jwt/jwt.service.interface';
import { Request } from 'express';

// createParamDecorator를 사용해 @AuthUser() 데코레이터를 만듭니다.
export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
  const request: Request = ctx.switchToHttp().getRequest();

  return request.user!;
});
