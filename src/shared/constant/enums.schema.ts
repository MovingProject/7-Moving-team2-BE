import { z } from 'zod';
import { ROLES, MOVE_TYPES, AREAS } from './values';

export const RoleSchema = z.enum(ROLES);
export const MoveTypeSchema = z.enum(MOVE_TYPES);
export const AreaSchema = z.enum(AREAS);
