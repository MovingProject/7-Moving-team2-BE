import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RefreshRaw = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();

  if (!request.refreshRaw) {
    throw new Error(
      'Refresh token payload가 존재하지 않습니다. 이 데코레이터를 사용하려면 @UseGuards(RefreshTokenGuard)가 필요합니다.',
    );
  }

  return request.refreshRaw;
});
