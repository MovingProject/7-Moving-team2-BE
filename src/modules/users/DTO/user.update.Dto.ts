import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { MoveType, Area } from '@prisma/client';

const driverProfileSchema = z.object({
  nickname: z.string().optional(),
  careerYears: z.string().optional(),
  oneLiner: z.string().optional(),
  description: z.string().optional(),
  rating: z.number().optional(),

  driverServiceAreas: z.union([z.array(z.nativeEnum(Area)), z.array(z.string())]).optional(),

  driverServiceTypes: z.union([z.array(z.nativeEnum(MoveType)), z.array(z.string())]).optional(),
});

const consumerProfileSchema = z.object({
  serviceType: z.union([z.nativeEnum(MoveType), z.string()]).optional(),
  areas: z.union([z.nativeEnum(Area), z.string()]).optional(),
  image: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  passwordHash: z.string().optional(),

  driverProfile: driverProfileSchema.optional(),
  consumerProfile: consumerProfileSchema.optional(),
});

export class UpdateUserProfileDto extends createZodDto(updateUserProfileSchema) {}
