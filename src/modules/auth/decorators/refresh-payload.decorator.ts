import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@/shared/jwt/jwt.payload.schema';
import { Request } from 'express';

export const RefreshPayload = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request: Request = ctx.switchToHttp().getRequest();

  if (!request.refresh) {
    throw new Error(
      'Refresh token payload가 존재하지 않습니다. 이 데코레이터를 사용하려면 @UseGuards(RefreshTokenGuard)가 필요합니다.',
    );
  }

  return request.refresh;
});
