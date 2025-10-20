import { z } from 'zod';
import { ROLES, MOVE_TYPES, AREAS, DRIVER_SORT_TYPES } from './values';

export const RoleSchema = z.enum(ROLES);
export const MoveTypeSchema = z.enum(MOVE_TYPES);
export const AreaSchema = z.enum(AREAS);
export const DriverSortTypeSchema = z.enum(DRIVER_SORT_TYPES);
