import { Role } from '@/shared/constant/values';
import { ForbiddenException } from '@/shared/exceptions/forbidden.exception';
import { UnauthorizedException } from '@/shared/exceptions/unauthorized.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const allowed =
      this.reflector.get<Role[]>(ROLES_KEY, ctx.getHandler()) ?? this.reflector.get<Role[]>(ROLES_KEY, ctx.getClass());

    if (!allowed || allowed.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    if (!user.role || !allowed.includes(user.role)) {
      throw new ForbiddenException(`이 작업을 수행하려면 ${allowed.join(', ')} 권한이 필요합니다.`);
    }

    return true;
  }
}
