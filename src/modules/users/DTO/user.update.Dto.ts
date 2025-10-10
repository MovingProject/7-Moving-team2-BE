import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { MoveType, Area } from '@prisma/client';

// 공통 UserProfile DTO
const updateUserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  profileImage: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  passwordHash: z.string().optional(),

  driverProfile: z
    .object({
      nickname: z.string().optional(),
      careerYears: z.string().optional(),
      oneLiner: z.string().optional(),
      description: z.string().optional(),
      rating: z.number().optional(),
      driverServiceAreas: z.array(z.nativeEnum(Area)).optional(),
      driverServiceTypes: z.array(z.nativeEnum(MoveType)).optional(),
    })
    .optional(),

  consumerProfile: z
    .object({
      serviceType: z.nativeEnum(MoveType).optional(),
      areas: z.nativeEnum(Area).optional(),
      image: z.string().optional(),
    })
    .optional(),
});

export class UpdateUserProfileDto extends createZodDto(updateUserProfileSchema) {}
