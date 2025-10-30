import { z } from 'zod';
import { AREAS, DRIVER_SORT_TYPES, MESSAGE_TYPES, MOVE_TYPES, QUOTATION_STATUSES, ROLES } from './values';

export const RoleSchema = z.enum(ROLES);
export const MoveTypeSchema = z.enum(MOVE_TYPES);
export const AreaSchema = z.enum(AREAS);
export const DriverSortTypeSchema = z.enum(DRIVER_SORT_TYPES);
export const MessageTypeSchema = z.enum(MESSAGE_TYPES);
export const QuotationStatusSchema = z.enum(QUOTATION_STATUSES);
