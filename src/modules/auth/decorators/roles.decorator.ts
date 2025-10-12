import { SetMetadata } from '@nestjs/common';
import { Role } from '@/shared/constant/values';

export const ROLES_KEY = 'allow_roles';
export const RequireRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
